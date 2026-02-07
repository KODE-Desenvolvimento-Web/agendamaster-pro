import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface Notification {
  id: string
  type: 'email' | 'whatsapp' | 'sms'
  recipient_email: string | null
  recipient_phone: string | null
  subject: string | null
  message: string
  template: string
}

async function sendEmail(notification: Notification): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@agendamaster.com',
        to: notification.recipient_email,
        subject: notification.subject || 'Notificação AgendaMaster',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AgendaMaster</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${notification.message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <div style="padding: 20px; text-align: center; background: #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Este email foi enviado automaticamente. Por favor, não responda.
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function sendWhatsApp(notification: Notification): Promise<{ success: boolean; error?: string }> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
  const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE')
  
  if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
    console.log('Evolution API not configured, skipping WhatsApp')
    return { success: false, error: 'Evolution API not configured' }
  }

  try {
    // Format phone number (remove non-digits, ensure country code)
    let phone = notification.recipient_phone?.replace(/\D/g, '') || ''
    if (phone.startsWith('0')) {
      phone = '55' + phone.substring(1)
    } else if (!phone.startsWith('55')) {
      phone = '55' + phone
    }

    const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: phone,
        text: notification.message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || 'Failed to send WhatsApp' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { notification_id, batch_size = 10 } = await req.json().catch(() => ({}))

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(batch_size)

    if (notification_id) {
      query = supabase
        .from('notifications')
        .select('*')
        .eq('id', notification_id)
    }

    const { data: notifications, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${notifications.length} notifications`)

    const results = await Promise.all(
      notifications.map(async (notification: Notification) => {
        let result: { success: boolean; error?: string }

        switch (notification.type) {
          case 'email':
            result = await sendEmail(notification)
            break
          case 'whatsapp':
            result = await sendWhatsApp(notification)
            break
          default:
            result = { success: false, error: `Unknown notification type: ${notification.type}` }
        }

        // Update notification status
        await supabase
          .from('notifications')
          .update({
            status: result.success ? 'sent' : 'failed',
            error_message: result.error || null,
            sent_at: result.success ? new Date().toISOString() : null,
          })
          .eq('id', notification.id)

        return {
          id: notification.id,
          type: notification.type,
          ...result,
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    console.log(`Processed: ${successCount} sent, ${failedCount} failed`)

    return new Response(
      JSON.stringify({
        processed: results.length,
        sent: successCount,
        failed: failedCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
