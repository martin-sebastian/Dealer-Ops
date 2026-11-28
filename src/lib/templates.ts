import type { PrintTemplate } from "@/lib/layout"
import { getSupabase } from "@/lib/supabase"

const LOCAL_KEY = "dealer-ops.print-templates"

type StoredRow = {
  id: string
  name: string
  page_width_in: number
  page_height_in: number
  layout: {
    backgroundUrl?: string
    elements?: PrintTemplate["elements"]
  }
  updated_at: string
}

/** Reads templates saved in localStorage. */
export function readLocalTemplates(): PrintTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) {
      return []
    }
    return JSON.parse(raw) as PrintTemplate[]
  } catch {
    return []
  }
}

/** Writes the full template list to localStorage. */
export function writeLocalTemplates(templates: PrintTemplate[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(templates))
  } catch {
    throw new Error(
      "This template is too large to save in this browser. Use a smaller background image or configure Supabase."
    )
  }
}

/** Upserts one template in localStorage and returns the list. */
export function saveLocalTemplate(template: PrintTemplate) {
  const next = template.updatedAt
    ? { ...template, updatedAt: new Date().toISOString() }
    : template
  const saved = { ...next, updatedAt: new Date().toISOString() }
  const list = readLocalTemplates().filter((item) => item.id !== saved.id)
  list.unshift(saved)
  writeLocalTemplates(list)
  return saved
}

/** Removes a template from localStorage. */
export function deleteLocalTemplate(id: string) {
  writeLocalTemplates(readLocalTemplates().filter((item) => item.id !== id))
}

/** Maps a Supabase row onto the in-app template shape. */
function fromRow(row: StoredRow): PrintTemplate {
  return {
    id: row.id,
    name: row.name,
    pageWidthIn: Number(row.page_width_in),
    pageHeightIn: Number(row.page_height_in),
    backgroundUrl: row.layout.backgroundUrl ?? "",
    elements: row.layout.elements ?? [],
    updatedAt: row.updated_at,
  }
}

/** Loads templates from Supabase when configured, else localStorage. */
export async function listTemplates(): Promise<PrintTemplate[]> {
  const supabase = getSupabase()
  if (!supabase) {
    return readLocalTemplates()
  }

  const { data, error } = await supabase
    .from("print_templates")
    .select("id,name,page_width_in,page_height_in,layout,updated_at")
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return readLocalTemplates()
  }

  const remote = (data as StoredRow[]).map(fromRow)
  try {
    writeLocalTemplates(remote)
  } catch {
    /* quota — still return the remote list */
  }
  return remote
}

/** Saves a named layout locally and to Supabase when available. */
export async function saveTemplate(template: PrintTemplate) {
  const saved = saveLocalTemplate(template)
  const supabase = getSupabase()
  if (!supabase) {
    return saved
  }

  const { error } = await supabase.from("print_templates").upsert({
    id: saved.id,
    name: saved.name,
    page_width_in: saved.pageWidthIn,
    page_height_in: saved.pageHeightIn,
    layout: {
      backgroundUrl: saved.backgroundUrl,
      elements: saved.elements,
    },
    updated_at: saved.updatedAt,
  })

  if (error) {
    throw error
  }

  return saved
}

/** Deletes a template from localStorage and Supabase. */
export async function deleteTemplate(id: string) {
  deleteLocalTemplate(id)
  const supabase = getSupabase()
  if (!supabase) {
    return
  }
  await supabase.from("print_templates").delete().eq("id", id)
}
