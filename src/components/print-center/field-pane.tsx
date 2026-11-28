import type { DragEvent } from "react"
import { ImageIcon, TypeIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  fieldsByModule,
  MODULE_LABELS,
  type CatalogField,
  type FieldModule,
} from "@/data/fields"

export const FIELD_MIME = "application/x-dealer-ops-field"

type FieldPaneProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Starts an HTML5 drag that carries the catalog field id. */
function startFieldDrag(event: DragEvent<HTMLButtonElement>, field: CatalogField) {
  event.dataTransfer.setData(FIELD_MIME, field.id)
  event.dataTransfer.effectAllowed = "copy"
}

/** One draggable field row in the left pane. */
function FieldRow({ field }: { field: CatalogField }) {
  return (
    <button
      type="button"
      draggable
      className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-sm hover:bg-muted"
      onDragStart={(event) => startFieldDrag(event, field)}
    >
      {field.kind === "image" ? (
        <ImageIcon className="size-3.5 text-muted-foreground" />
      ) : (
        <TypeIcon className="size-3.5 text-muted-foreground" />
      )}
      <span className="flex-1 truncate">{field.label}</span>
      {field.kind === "image" ? (
        <Badge variant="secondary">CDN</Badge>
      ) : null}
    </button>
  )
}

/**
 * Collapsible left pane of module fields. Sales, service, and customer are
 * separate groups with no joined columns.
 */
export function FieldPane({ open, onOpenChange }: FieldPaneProps) {
  const groups = fieldsByModule()
  const modules = Object.keys(groups) as FieldModule[]

  if (!open) {
    return (
      <div className="flex w-9 flex-col items-center border-r bg-sidebar py-2">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onOpenChange(true)}
          aria-label="Show fields"
        >
          <TypeIcon />
        </Button>
      </div>
    )
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-sm font-medium">Fields</p>
        <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
          Hide
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <Accordion className="px-2" defaultValue={modules} multiple>
          {modules.map((module) => (
            <AccordionItem key={module} value={module}>
              <AccordionTrigger>{MODULE_LABELS[module]}</AccordionTrigger>
              <AccordionContent>
                {groups[module].map((field) => (
                  <FieldRow key={field.id} field={field} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </aside>
  )
}
