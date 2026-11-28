import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { PrinterIcon, SearchIcon } from "lucide-react"

import { PagePreview } from "@/components/print-center/page-preview"
import { PreviewDialog } from "@/components/print-center/preview-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PrintTemplate } from "@/lib/layout"
import { pageSizeLabel } from "@/lib/layout"
import { sendToPrinter } from "@/lib/print"
import { listTemplates } from "@/lib/templates"

/**
 * Filterable list of saved templates. Multi-select, preview with zoom, and
 * send to the PC print dialog (PDF / installed printers).
 */
export function PrintView() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  /** Loads saved layouts for the print queue. */
  useEffect(() => {
    void listTemplates().then(setTemplates)
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return templates
    }
    return templates.filter((template) => {
      const haystack = `${template.name} ${pageSizeLabel(template)}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [query, templates])

  const selectedTemplates = templates.filter((template) =>
    selected.includes(template.id)
  )

  /** Toggles one row in the multi-select set. */
  function toggle(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    )
  }

  /** Selects or clears every visible row. */
  function toggleAll(checked: boolean) {
    setSelected(checked ? filtered.map((template) => template.id) : [])
  }

  /** Prints the selected templates at 1× through the OS dialog. */
  function handlePrint() {
    if (selectedTemplates.length === 0) {
      toast.error("Select at least one template.")
      return
    }
    sendToPrinter()
  }

  const printSize = selectedTemplates[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {printSize ? (
        <style>{`@media print { @page { size: ${printSize.pageWidthIn}in ${printSize.pageHeightIn}in; margin: 0; } }`}</style>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="pointer-events-none absolute top-2 left-2 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Filter by name or page size"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            disabled={selectedTemplates.length === 0}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            disabled={selectedTemplates.length === 0}
            onClick={handlePrint}
          >
            <PrinterIcon />
            Send to print
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    filtered.length > 0 &&
                    filtered.every((template) => selected.includes(template.id))
                  }
                  onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Page size</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No saved templates yet. Save one from the designer.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(template.id)}
                      onCheckedChange={(checked) =>
                        toggle(template.id, Boolean(checked))
                      }
                      aria-label={`Select ${template.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{pageSizeLabel(template)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(template.updatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <PreviewDialog
        templates={selectedTemplates}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
      <div className="print-root hidden print:block" aria-hidden>
        {selectedTemplates.map((template) => (
          <div key={template.id} className="print-page">
            <PagePreview template={template} />
          </div>
        ))}
      </div>
    </div>
  )
}
