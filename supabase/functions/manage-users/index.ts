import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cliente com token do usuário para verificar permissões
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cliente admin para operações privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar role do usuário atual
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role, organization_id')
      .eq('user_id', user.id)

    const isSuperAdmin = userRoles?.some(r => r.role === 'super_admin')
    const orgAdminOrgs = userRoles?.filter(r => r.role === 'org_admin').map(r => r.organization_id) || []

    const { action, ...data } = await req.json()

    switch (action) {
      case 'create_user': {
        const { email, password, full_name, role, organization_id } = data

        // Validação de permissões
        if (role === 'super_admin' || role === 'org_admin') {
          if (!isSuperAdmin) {
            return new Response(
              JSON.stringify({ error: 'Apenas super admins podem criar administradores' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else if (role === 'staff' || role === 'customer') {
          if (!isSuperAdmin && !orgAdminOrgs.includes(organization_id)) {
            return new Response(
              JSON.stringify({ error: 'Sem permissão para criar usuários nesta organização' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        // Criar usuário
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Criar perfil
        await supabaseAdmin.from('profiles').insert({
          user_id: newUser.user.id,
          full_name,
        })

        // Criar role
        await supabaseAdmin.from('user_roles').insert({
          user_id: newUser.user.id,
          role,
          organization_id: role !== 'super_admin' ? organization_id : null,
        })

        return new Response(
          JSON.stringify({ success: true, user_id: newUser.user.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_user': {
        const { user_id } = data

        if (!isSuperAdmin) {
          // Verificar se org_admin tem permissão sobre este usuário
          const { data: targetRoles } = await supabaseAdmin
            .from('user_roles')
            .select('organization_id')
            .eq('user_id', user_id)

          const hasPermission = targetRoles?.some(r => orgAdminOrgs.includes(r.organization_id))
          if (!hasPermission) {
            return new Response(
              JSON.stringify({ error: 'Sem permissão para deletar este usuário' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)
        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list_users': {
        const { organization_id } = data

        let query = supabaseAdmin
          .from('user_roles')
          .select(`
            user_id,
            role,
            organization_id,
            created_at,
            profiles!inner(full_name, avatar_url, phone),
            organizations(name, slug)
          `)

        if (isSuperAdmin) {
          if (organization_id) {
            query = query.eq('organization_id', organization_id)
          }
        } else if (orgAdminOrgs.length > 0) {
          query = query.in('organization_id', orgAdminOrgs)
        } else {
          return new Response(
            JSON.stringify({ error: 'Sem permissão' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: users, error: listError } = await query

        if (listError) {
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Buscar emails dos usuários
        const userIds = [...new Set(users?.map(u => u.user_id) || [])]
        const usersWithEmail = await Promise.all(
          userIds.map(async (uid) => {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(uid)
            return { id: uid, email: authUser?.user?.email }
          })
        )

        const emailMap = Object.fromEntries(usersWithEmail.map(u => [u.id, u.email]))

        const enrichedUsers = users?.map(u => ({
          ...u,
          email: emailMap[u.user_id],
        }))

        return new Response(
          JSON.stringify({ users: enrichedUsers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
