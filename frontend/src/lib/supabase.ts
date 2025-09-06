import { createClient } from '@supabase/supabase-js'

// Account A - Ideas Pool (Read Only)
export const supabaseA = createClient(
  import.meta.env.VITE_SUPABASE_A_URL,
  import.meta.env.VITE_SUPABASE_A_ANON_KEY
)

// Account B - User Data (Full CRUD)
export const supabaseB = createClient(
  import.meta.env.VITE_SUPABASE_B_URL,
  import.meta.env.VITE_SUPABASE_B_ANON_KEY
)

export default supabaseB