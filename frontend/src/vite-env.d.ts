interface ImportMetaEnv {
  readonly VITE_SUPABASE_A_URL: string
  readonly VITE_SUPABASE_B_URL: string
  readonly VITE_SUPABASE_A_ANON_KEY: string
  readonly VITE_SUPABASE_B_ANON_KEY: string
  // readonly VITE_SUPABASE_URL: string
  // readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
