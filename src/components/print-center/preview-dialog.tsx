import { useState } from "react"

import { PagePreview } from "@/components/print-center/page-preview"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { inchesToPx } from "@/data/page-sizes"
import type { PrintTemplate } from "@/lib/layout"
import { pageSizeLabel } from "@/lib/layout"
import {
  sendToPrinter,
  usesLetterZoom,
  type LetterZoom,
} from "@/lib/print"

const LETTER_ZOOMS: { value: LetterZoom; label: string }[] = [
  { value: 1, label: "Full" },
  { value: 0.5, label: "Half" },
  { value: 0.666, label: "Two-thirds" },
  { value: 1.25, label: "1.25× peek" },
]

type PreviewDialogProps = {
  templates: PrintTemplate[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal preview with zoom. Small labels preview at 2× (print stays 1×).
 * 8.5×11 hang tags can preview at full, half, two-thirds, or 1.25× peek.
 */
export function PreviewDialog({
  templates,
  open,
  onOpenChange,
}: PreviewDialogProps) {
  const [letterZoom, setLetterZoom] = useState<LetterZoom>(1)
  const first = templates[0]

  /** Closes the modal first so only `.print-root` is in the print tree. */
  function handlePrint() {
    onOpenChange(false)
    window.setTimeout(() => {
      sendToPrinter()
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden print:hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Print preview</DialogTitle>
          <DialogDescription>
            Zoom is preview only. Print always uses 1× at the stored page size.
          </DialogDescription>
        </DialogHeader>
        {first && usesLetterZoom(first.pageWidthIn, first.pageHeightIn) ? (
          <ButtonGroup>
            {LETTER_ZOOMS.map((zoom) => (
              <Button
                key={zoom.value}
                variant={letterZoom === zoom.value ? "default" : "outline"}
                onClick={() => setLetterZoom(zoom.value)}
              >
                {zoom.label}
              </Button>
            ))}
          </ButtonGroup>
        ) : (
          <p className="text-sm text-muted-foreground">
            Small labels preview at 2×. Printed output stays 1×.
          </p>
        )}
        <div className="max-h-[60vh] overflow-auto bg-muted/40 p-4">
          {templates.map((template) => {
            const zoom = usesLetterZoom(
              template.pageWidthIn,
              template.pageHeightIn
            )
              ? letterZoom
              : 2
            const width = inchesToPx(template.pageWidthIn) * zoom
            const height = inchesToPx(template.pageHeightIn) * zoom
            return (
              <div key={template.id} className="mb-6 last:mb-0">
                <p className="mb-2 text-xs text-muted-foreground">
                  {template.name} · {pageSizeLabel(template)}
                </p>
                <div className="overflow-auto" style={{ maxWidth: "100%" }}>
                  <div style={{ width, height }}>
                    <div
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <PagePreview template={template} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button onClick={handlePrint}>Send to print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
