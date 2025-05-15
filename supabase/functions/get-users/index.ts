
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the admin role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get auth header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT token to ensure the request is from an authenticated user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      throw profilesError
    }

    // Get detailed user data including emails
    const usersWithEmails = await Promise.all(
      profiles.map(async (profile) => {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id)
        
        if (userError) {
          console.error(`Error fetching user ${profile.id}:`, userError)
          return {
            ...profile,
            email: 'Error retrieving email',
          }
        }
        
        return {
          id: profile.id,
          email: userData?.user?.email || 'No email found',
          full_name: profile.full_name || '',
          role: profile.role || 'staff',
          active: profile.active !== undefined ? profile.active : false,
          last_active: profile.last_active ? new Date(profile.last_active).toLocaleString() : 'Never',
          created_at: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '',
        }
      })
    )

    return new Response(
      JSON.stringify({ users: usersWithEmails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
