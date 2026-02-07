-- ============================================================
-- AgendaMaster Pro - Database Functions
-- Execute this file second in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. ROLE CHECK FUNCTIONS (Security Definer to avoid RLS recursion)
-- ============================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Check if user is org admin for a specific organization
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'org_admin'
      AND organization_id = _org_id
  )
$$;

-- ============================================================
-- 2. BOOKING CONFLICT CHECK
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  _organization_id uuid,
  _staff_id uuid,
  _scheduled_at timestamptz,
  _duration integer,
  _exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _end_time timestamptz;
  _has_conflict boolean;
BEGIN
  _end_time := _scheduled_at + (_duration || ' minutes')::interval;
  
  SELECT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.organization_id = _organization_id
      AND a.staff_id = _staff_id
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (a.id != _exclude_appointment_id OR _exclude_appointment_id IS NULL)
      AND (
        -- New appointment starts during existing appointment
        (_scheduled_at >= a.scheduled_at AND _scheduled_at < a.scheduled_at + (a.duration || ' minutes')::interval)
        OR
        -- New appointment ends during existing appointment
        (_end_time > a.scheduled_at AND _end_time <= a.scheduled_at + (a.duration || ' minutes')::interval)
        OR
        -- New appointment completely contains existing appointment
        (_scheduled_at <= a.scheduled_at AND _end_time >= a.scheduled_at + (a.duration || ' minutes')::interval)
      )
  ) INTO _has_conflict;
  
  RETURN _has_conflict;
END;
$$;

-- ============================================================
-- 3. NOTIFICATION TRIGGERS
-- ============================================================

-- Create notification for new appointments
CREATE OR REPLACE FUNCTION public.create_appointment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _customer_name text;
  _customer_email text;
  _customer_phone text;
  _service_name text;
BEGIN
  -- Get customer info
  SELECT c.name, c.email, c.phone 
  INTO _customer_name, _customer_email, _customer_phone
  FROM customers c WHERE c.id = NEW.customer_id;
  
  -- Get service name
  SELECT s.name INTO _service_name
  FROM services s WHERE s.id = NEW.service_id;

  -- Create confirmation notification
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (
      organization_id, 
      appointment_id, 
      type, 
      channel,
      recipient_email, 
      recipient_phone, 
      subject, 
      message, 
      status, 
      scheduled_for
    ) VALUES (
      NEW.organization_id, 
      NEW.id, 
      'confirmation',
      CASE WHEN _customer_phone IS NOT NULL THEN 'whatsapp' ELSE 'email' END,
      _customer_email, 
      _customer_phone, 
      'Agendamento Confirmado',
      format('Olá %s! Seu agendamento de %s foi confirmado para %s.',
        _customer_name, 
        _service_name, 
        to_char(NEW.scheduled_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY às HH24:MI')
      ), 
      'pending', 
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create notification for status changes
CREATE OR REPLACE FUNCTION public.create_status_change_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _customer_name text;
  _customer_email text;
  _customer_phone text;
  _service_name text;
  _notification_type text;
  _message text;
  _subject text;
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get customer info
  SELECT c.name, c.email, c.phone 
  INTO _customer_name, _customer_email, _customer_phone
  FROM customers c WHERE c.id = NEW.customer_id;
  
  -- Get service name
  SELECT s.name INTO _service_name
  FROM services s WHERE s.id = NEW.service_id;

  -- Determine notification based on new status
  IF NEW.status = 'cancelled' THEN
    _notification_type := 'cancellation';
    _subject := 'Agendamento Cancelado';
    _message := format('Olá %s, seu agendamento de %s para %s foi cancelado.', 
      _customer_name, 
      _service_name, 
      to_char(NEW.scheduled_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY às HH24:MI')
    );
  ELSIF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    _notification_type := 'confirmation';
    _subject := 'Agendamento Confirmado';
    _message := format('Olá %s! Seu agendamento de %s foi confirmado para %s.', 
      _customer_name, 
      _service_name, 
      to_char(NEW.scheduled_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY às HH24:MI')
    );
  ELSIF NEW.status = 'completed' THEN
    _notification_type := 'feedback';
    _subject := 'Como foi sua experiência?';
    _message := format('Olá %s! Esperamos que tenha gostado do serviço %s. Conte-nos como foi sua experiência!', 
      _customer_name, 
      _service_name
    );
  ELSE
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    organization_id, 
    appointment_id, 
    type, 
    channel,
    recipient_email, 
    recipient_phone, 
    subject, 
    message, 
    status, 
    scheduled_for
  ) VALUES (
    NEW.organization_id, 
    NEW.id, 
    _notification_type,
    CASE WHEN _customer_phone IS NOT NULL THEN 'whatsapp' ELSE 'email' END,
    _customer_email, 
    _customer_phone, 
    _subject, 
    _message, 
    'pending', 
    now()
  );
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- 4. CREATE TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trigger_appointment_notification ON appointments;
CREATE TRIGGER trigger_appointment_notification
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notification();

DROP TRIGGER IF EXISTS trigger_status_change_notification ON appointments;
CREATE TRIGGER trigger_status_change_notification
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_status_change_notification();

-- ============================================================
-- 5. CUSTOMER STATS UPDATE
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE customers
    SET 
      total_visits = total_visits + 1,
      total_spent = total_spent + NEW.price,
      last_visit_at = NEW.scheduled_at
    WHERE id = NEW.customer_id;
  ELSIF NEW.status = 'no_show' AND OLD.status != 'no_show' THEN
    UPDATE customers
    SET no_shows = no_shows + 1
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_customer_stats ON appointments;
CREATE TRIGGER trigger_update_customer_stats
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();
