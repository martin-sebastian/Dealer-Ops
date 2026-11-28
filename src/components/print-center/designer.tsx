import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { ImageUpIcon, SaveIcon } from "lucide-react"

import { FieldPane } from "@/components/print-center/field-pane"
import { PagePreview } from "@/components/print-center/page-preview"
import { StyleBar } from "@/components/print-center/style-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getField } from "@/data/fields"
import { PAGE_SIZES, snapInches } from "@/data/page-sizes"
import {
  clampElementsToPage,
  createImageElement,
  createTemplate,
  createTextElement,
  type LayoutElement,
  type PrintTemplate,
  type TextElement,
} from "@/lib/layout"
import { uploadPrintImage } from "@/lib/supabase"
import { listTemplates, saveTemplate } from "@/lib/templates"

const DRAFT_KEY = "dealer-ops.print-draft"

/** Restores the in-progress designer layout after leaving the section. */
function readDraft(): PrintTemplate {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) {
      return JSON.parse(raw) as PrintTemplate
    }
  } catch {
    /* ignore bad drafts */
  }
  return createTemplate("Hang tag")
}

/** Finds the matching preset id for a stored width/height pair. */
function presetIdFor(widthIn: number, heightIn: number) {
  return (
    PAGE_SIZES.find(
      (size) => size.widthIn === widthIn && size.heightIn === heightIn
    )?.id ?? "letter"
  )
}

/**
 * Print Center designer: dotted-grid canvas, field pane, page size, and
 * named template save. One element is selected at a time.
 */
export function Designer() {
  const [template, setTemplate] = useState<PrintTemplate>(readDraft)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [paneOpen, setPaneOpen] = useState(true)
  const [saved, setSaved] = useState<PrintTemplate[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => template.elements.find((element) => element.id === selectedId) ?? null,
    [template.elements, selectedId]
  )

  /** Loads previously saved templates into the name picker. */
  useEffect(() => {
    void listTemplates().then(setSaved)
  }, [])

  /** Keeps the current layout if the user leaves Print Center and comes back. */
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(template))
    } catch {
      /* ignore quota errors */
    }
  }, [template])

  /** Patches the current template and clears stale selection if needed. */
  function updateTemplate(patch: Partial<PrintTemplate>) {
    setTemplate((current) => ({ ...current, ...patch }))
  }

  /** Replaces one element in the layout. */
  function updateElement(id: string, patch: Partial<LayoutElement>) {
    setTemplate((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === id ? ({ ...element, ...patch } as LayoutElement) : element
      ),
    }))
  }

  /** Applies a page-size preset. Labels are not stored — only inches. */
  function applyPageSize(id: string | null) {
    if (!id) {
      return
    }
    const size = PAGE_SIZES.find((item) => item.id === id)
    if (!size) {
      return
    }
    setTemplate((current) => ({
      ...current,
      pageWidthIn: size.widthIn,
      pageHeightIn: size.heightIn,
      elements: clampElementsToPage(
        current.elements,
        size.widthIn,
        size.heightIn
      ),
    }))
  }

  /** Drops a catalog field onto the canvas as text or image. */
  function handleDropField(fieldId: string, x: number, y: number) {
    const field = getField(fieldId)
    if (!field) {
      return
    }
    const nextX = snapInches(x)
    const nextY = snapInches(y)
    const created =
      field.kind === "image"
        ? createImageElement(fieldId, nextX, nextY)
        : createTextElement(fieldId, nextX, nextY)
    const [element] = clampElementsToPage(
      [created],
      template.pageWidthIn,
      template.pageHeightIn
    )
    setTemplate((current) => ({
      ...current,
      elements: [...current.elements, element],
    }))
    setSelectedId(element.id)
  }

  /** Saves the full layout under the current name. */
  async function handleSave() {
    const name = template.name.trim()
    if (!name) {
      toast.error("Name the template before saving.")
      return
    }
    try {
      const savedTemplate = await saveTemplate({ ...template, name })
      setTemplate(savedTemplate)
      setSaved(await listTemplates())
      toast.success(`Saved ${savedTemplate.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save")
    }
  }

  /** Uploads a background image to the Supabase print-images bucket. */
  async function handleBackground(file: File | undefined) {
    if (!file) {
      return
    }
    try {
      const url = await uploadPrintImage(file)
      updateTemplate({ backgroundUrl: url })
      toast.success("Background image added")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    }
  }

  /** Loads a saved template into the designer. */
  function loadSaved(id: string | null) {
    if (!id) {
      return
    }
    const found = saved.find((item) => item.id === id)
    if (found) {
      setTemplate(found)
      setSelectedId(null)
    }
  }

  /** Starts a new blank layout at the current page size. */
  function handleNew() {
    setTemplate(
      createTemplate("Untitled", template.pageWidthIn, template.pageHeightIn)
    )
    setSelectedId(null)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <FieldPane open={paneOpen} onOpenChange={setPaneOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-nowrap items-end gap-3 overflow-x-auto border-b p-3">
          <div className="grid gap-1">
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              className="w-40"
              value={template.name}
              onChange={(event) => updateTemplate({ name: event.target.value })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Page size</Label>
            <Select
              value={presetIdFor(template.pageWidthIn, template.pageHeightIn)}
              onValueChange={applyPageSize}
            >
              <SelectTrigger className="w-40">
                <span className="truncate">
                  {
                    PAGE_SIZES.find(
                      (size) =>
                        size.id ===
                        presetIdFor(template.pageWidthIn, template.pageHeightIn)
                    )?.label
                  }
                </span>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Saved templates</Label>
            <Select value={null} onValueChange={loadSaved}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Load…" />
              </SelectTrigger>
              <SelectContent>
                {saved.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input
            ref={fileRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(event) => {
              void handleBackground(event.target.files?.[0])
              event.target.value = ""
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <ImageUpIcon />
            Background
          </Button>
          <Button variant="outline" onClick={handleNew}>
            New
          </Button>
          <Button onClick={() => void handleSave()}>
            <SaveIcon />
            Save
          </Button>
        </div>
        <div className="min-h-12 border-b px-3 py-2">
          <StyleBar
            element={selected}
            onChange={(patch) => {
              if (selected?.kind === "text") {
                updateElement(selected.id, patch as Partial<TextElement>)
              }
            }}
            onToggleSnap={(snap) => {
              if (selected) {
                updateElement(selected.id, { snap })
              }
            }}
            onDelete={() => {
              if (!selected) {
                return
              }
              setTemplate((current) => ({
                ...current,
                elements: current.elements.filter(
                  (element) => element.id !== selected.id
                ),
              }))
              setSelectedId(null)
            }}
          />
        </div>
        <ScrollArea className="min-h-0 flex-1 bg-muted/40">
          <div className="flex justify-center p-6">
            <PagePreview
              interactive
              showGrid
              template={template}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onMove={(id, x, y) => updateElement(id, { x, y })}
              onDropField={handleDropField}
            />
          </div>
        </ScrollArea>
        <Separator />
      </div>
    </div>
  )
}
