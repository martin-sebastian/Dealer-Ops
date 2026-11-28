import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const PRINT_IMAGE_BUCKET = "print-images"

let client: SupabaseClient | null | undefined

/** Returns a browser Supabase client, or null when env vars are missing. */
export function getSupabase() {
  if (client !== undefined) {
    return client
  }

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    client = null
    return client
  }

  client = createClient(url, key)
  return client
}

/**
 * Uploads a background image to the print-images bucket and returns its
 * public CDN URL. Falls back to a local object URL when Supabase is unset.
 */
export async function uploadPrintImage(file: File) {
  const supabase = getSupabase()
  const ext = file.name.split(".").pop()?.toLowerCase() || "png"
  const path = `${crypto.randomUUID()}.${ext}`

  if (!supabase) {
    return URL.createObjectURL(file)
  }

  const { error } = await supabase.storage
    .from(PRINT_IMAGE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(PRINT_IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
