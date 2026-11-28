import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const PRINT_IMAGE_BUCKET = "print-images"
/** Local data URLs must stay well under the ~5 MB session/localStorage quota. */
const MAX_LOCAL_IMAGE_BYTES = 1024 * 1024

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

/** Reads a file as a durable data URL for localStorage fallback. */
function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads a background image to the print-images bucket and returns its
 * public CDN URL. Falls back to a data URL when Supabase is unset so the
 * image survives reload.
 */
export async function uploadPrintImage(file: File) {
  const supabase = getSupabase()
  const ext = file.name.split(".").pop()?.toLowerCase() || "png"
  const path = `${crypto.randomUUID()}.${ext}`

  if (!supabase) {
    if (file.size > MAX_LOCAL_IMAGE_BYTES) {
      throw new Error(
        "Image is too large to store locally. Choose a file under 1 MB."
      )
    }
    return readFileAsDataUrl(file)
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
