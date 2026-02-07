import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface BookingRequest {
  organization_id: string
  staff_id: string | null
  scheduled_at: string
  duration: number
  exclude_appointment_id?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      organization_id, 
      staff_id, 
      scheduled_at, 
      duration,
      exclude_appointment_id 
    }: BookingRequest = await req.json()

    // Validate required fields
    if (!organization_id || !scheduled_at || !duration) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: organization_id, scheduled_at, duration' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check organization subscription status
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('status, trial_ends_at')
      .eq('id', organization_id)
      .single()

    if (orgError || !org) {
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if organization can accept bookings
    const now = new Date()
    const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null
    
    if (org.status === 'inactive') {
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: 'organization_inactive',
          message: 'Esta empresa não está aceitando agendamentos no momento.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (org.status === 'trial' && trialEndsAt && trialEndsAt < now) {
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: 'trial_expired',
          message: 'O período de teste desta empresa expirou.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no staff_id, skip conflict check (any staff available)
    if (!staff_id) {
      return new Response(
        JSON.stringify({ available: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call the database function to check for conflicts
    const { data: hasConflict, error: conflictError } = await supabase
      .rpc('check_booking_conflict', {
        _organization_id: organization_id,
        _staff_id: staff_id,
        _scheduled_at: scheduled_at,
        _duration: duration,
        _exclude_appointment_id: exclude_appointment_id || null,
      })

    if (conflictError) {
      console.error('Error checking booking conflict:', conflictError)
      return new Response(
        JSON.stringify({ error: 'Error checking availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (hasConflict) {
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: 'double_booking',
          message: 'Este horário já está ocupado para o profissional selecionado.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get available time slots for the day if requested
    const scheduledDate = new Date(scheduled_at)
    const dayOfWeek = scheduledDate.getDay()

    const { data: businessHours } = await supabase
      .from('business_hours')
      .select('opens_at, closes_at, is_closed')
      .eq('organization_id', organization_id)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (businessHours?.is_closed) {
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: 'closed',
          message: 'A empresa não funciona neste dia.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if time is within business hours
    if (businessHours) {
      const [openHour, openMin] = businessHours.opens_at.split(':').map(Number)
      const [closeHour, closeMin] = businessHours.closes_at.split(':').map(Number)
      
      const scheduledHour = scheduledDate.getHours()
      const scheduledMin = scheduledDate.getMinutes()
      const endTime = new Date(scheduledDate.getTime() + duration * 60000)
      const endHour = endTime.getHours()
      const endMin = endTime.getMinutes()

      const scheduledTimeMinutes = scheduledHour * 60 + scheduledMin
      const openTimeMinutes = openHour * 60 + openMin
      const closeTimeMinutes = closeHour * 60 + closeMin
      const endTimeMinutes = endHour * 60 + endMin

      if (scheduledTimeMinutes < openTimeMinutes || endTimeMinutes > closeTimeMinutes) {
        return new Response(
          JSON.stringify({ 
            available: false, 
            reason: 'outside_business_hours',
            message: `Horário fora do expediente. Funcionamos das ${businessHours.opens_at} às ${businessHours.closes_at}.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ available: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in check-booking:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
