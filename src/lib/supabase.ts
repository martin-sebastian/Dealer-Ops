import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const PRINT_IMAGE_BUCKET = "print-images"
/** Caps decoded source files so the local fallback never reads a huge blob. */
const MAX_LOCAL_SOURCE_BYTES = 12 * 1024 * 1024
/** Keeps data URLs under typical 5 MB session/local storage quotas. */
const MAX_LOCAL_DATA_URL_CHARS = 1_200_000
/** Letter size at 96 DPI; CSS scales the image to the page. */
const MAX_LOCAL_IMAGE_PX = { width: 816, height: 1056 }

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

/** Loads an image from a temporary object URL. */
function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not read that image."))
    image.src = url
  })
}

/** Encodes a canvas as JPEG, stepping quality down until it fits storage.
 * Callers must paint an opaque background first; JPEG has no alpha. */
function canvasToFittingDataUrl(canvas: HTMLCanvasElement) {
  for (const quality of [0.82, 0.64, 0.48]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality)
    if (dataUrl.length <= MAX_LOCAL_DATA_URL_CHARS) {
      return dataUrl
    }
  }
  return null
}

/**
 * Builds a data URL that fits browser storage. Small files stay as-is;
 * larger photos are resized to letter size, composited on white, and
 * JPEG-compressed so transparent pixels do not become black.
 */
async function localBackgroundDataUrl(file: File) {
  if (file.size > MAX_LOCAL_SOURCE_BYTES) {
    throw new Error("Background images must be 12 MB or smaller.")
  }
  if (file.size * 1.37 <= MAX_LOCAL_DATA_URL_CHARS) {
    return readFileAsDataUrl(file)
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImageFromUrl(objectUrl)
    const scale = Math.min(
      1,
      MAX_LOCAL_IMAGE_PX.width / image.width,
      MAX_LOCAL_IMAGE_PX.height / image.height
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not process that image.")
    }
    context.fillStyle = "#fff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvasToFittingDataUrl(canvas)
    if (!dataUrl) {
      throw new Error(
        "Background image is too large to store locally. Use a smaller file or configure Supabase."
      )
    }
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
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
    return localBackgroundDataUrl(file)
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
