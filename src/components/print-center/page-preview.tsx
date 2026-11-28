import type { DragEvent, PointerEvent as ReactPointerEvent } from "react"

import { FIELD_MIME } from "@/components/print-center/field-pane"
import { getField } from "@/data/fields"
import { inchesToPx } from "@/data/page-sizes"
import type { LayoutElement, PrintTemplate } from "@/lib/layout"
import { sampleForField } from "@/lib/layout"
import { cn } from "@/lib/utils"

type PagePreviewProps = {
  template: PrintTemplate
  selectedId?: string | null
  showGrid?: boolean
  interactive?: boolean
  onSelect?: (id: string | null) => void
  onMove?: (id: string, x: number, y: number) => void
  onDropField?: (fieldId: string, x: number, y: number) => void
}

/** Converts a pointer event into inches relative to the page origin. */
function eventToInches(
  event: { clientX: number; clientY: number },
  page: HTMLElement
) {
  const rect = page.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) / (rect.width / pageOffsetWidthIn(page)),
    y: (event.clientY - rect.top) / (rect.height / pageOffsetHeightIn(page)),
  }
}

/** Reads the designed page width from a data attribute. */
function pageOffsetWidthIn(page: HTMLElement) {
  return Number(page.dataset.widthIn)
}

/** Reads the designed page height from a data attribute. */
function pageOffsetHeightIn(page: HTMLElement) {
  return Number(page.dataset.heightIn)
}

/** Keeps a dragged element's origin on the page so it stays selectable. */
function clampToPage(
  x: number,
  y: number,
  element: LayoutElement,
  widthIn: number,
  heightIn: number
) {
  const keepX = element.kind === "image" ? element.width : 1.2
  const keepY = element.kind === "image" ? element.height : 0.35
  return {
    x: Math.min(
      Math.max(0, x),
      Math.max(0, widthIn - Math.min(keepX, widthIn))
    ),
    y: Math.min(
      Math.max(0, y),
      Math.max(0, heightIn - Math.min(keepY, heightIn))
    ),
  }
}

/**
 * Renders a template at 1×. Designer mode adds a dotted grid, selection, and
 * drag. Print/preview omit chrome so output matches the stored layout.
 */
export function PagePreview({
  template,
  selectedId,
  showGrid = false,
  interactive = false,
  onSelect,
  onMove,
  onDropField,
}: PagePreviewProps) {
  const width = inchesToPx(template.pageWidthIn)
  const height = inchesToPx(template.pageHeightIn)

  /** Starts dragging a selected element; snap is read from that element. */
  function handleElementPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    element: LayoutElement
  ) {
    if (!interactive || !onMove) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    onSelect?.(element.id)

    const page = event.currentTarget.closest("[data-print-page]") as HTMLElement
    const origin = eventToInches(event, page)
    const startX = element.x
    const startY = element.y

    /** Moves the element, snapping when the element's snap flag is on. */
    function onPointerMove(moveEvent: PointerEvent) {
      const next = eventToInches(moveEvent, page)
      let x = startX + (next.x - origin.x)
      let y = startY + (next.y - origin.y)
      if (element.snap) {
        const step = 0.125
        x = Math.round(x / step) * step
        y = Math.round(y / step) * step
      }
      const clamped = clampToPage(
        x,
        y,
        element,
        template.pageWidthIn,
        template.pageHeightIn
      )
      onMove?.(element.id, clamped.x, clamped.y)
    }

    /** Drops the pointer listeners when the drag ends or is cancelled. */
    function onPointerUp() {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerUp)
  }

  /** Places a dragged catalog field onto the page. */
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!onDropField) {
      return
    }
    event.preventDefault()
    const fieldId = event.dataTransfer.getData(FIELD_MIME)
    if (!fieldId) {
      return
    }
    const point = eventToInches(event, event.currentTarget)
    onDropField(fieldId, Math.max(0, point.x), Math.max(0, point.y))
  }

  return (
    <div
      data-print-page
      data-width-in={template.pageWidthIn}
      data-height-in={template.pageHeightIn}
      className={cn(
        "relative shrink-0 overflow-hidden bg-white text-black shadow-sm",
        interactive && "cursor-default"
      )}
      style={{
        width,
        height,
        backgroundImage: [
          showGrid
            ? "radial-gradient(circle, color-mix(in oklab, black 28%, transparent) 1px, transparent 1.2px)"
            : "",
          template.backgroundUrl ? `url(${template.backgroundUrl})` : "",
        ]
          .filter(Boolean)
          .join(", "),
        backgroundSize: template.backgroundUrl
          ? showGrid
            ? `${inchesToPx(0.125)}px ${inchesToPx(0.125)}px, 100% 100%`
            : "100% 100%"
          : showGrid
            ? `${inchesToPx(0.125)}px ${inchesToPx(0.125)}px`
            : undefined,
        backgroundRepeat: template.backgroundUrl
          ? showGrid
            ? "repeat, no-repeat"
            : "no-repeat"
          : "repeat",
        backgroundPosition: "center",
      }}
      onClick={() => onSelect?.(null)}
      onDragOver={(event) => interactive && event.preventDefault()}
      onDrop={handleDrop}
    >
      {template.elements.map((element) => {
        const selected = element.id === selectedId
        if (element.kind === "image") {
          const src = sampleForField(element.fieldId)
          return (
            <div
              key={element.id}
              className={cn(
                "absolute overflow-hidden",
                interactive && "cursor-grab",
                selected && interactive && "ring-2 ring-blue-600"
              )}
              style={{
                left: inchesToPx(element.x),
                top: inchesToPx(element.y),
                width: inchesToPx(element.width),
                height: inchesToPx(element.height),
              }}
              onPointerDown={(event) =>
                handleElementPointerDown(event, element)
              }
              onClick={(event) => {
                event.stopPropagation()
                onSelect?.(element.id)
              }}
            >
              <img
                alt={getField(element.fieldId)?.label ?? "Image"}
                className="size-full object-cover"
                draggable={false}
                src={src}
              />
            </div>
          )
        }

        return (
          <div
            key={element.id}
            className={cn(
              "absolute whitespace-nowrap",
              interactive && "cursor-grab",
              selected && interactive && "ring-2 ring-blue-600"
            )}
            style={{
              left: inchesToPx(element.x),
              top: inchesToPx(element.y),
              color: element.color,
              fontSize: element.fontSize,
              fontWeight: element.bold ? 700 : 400,
              lineHeight: 1.1,
            }}
            onPointerDown={(event) => handleElementPointerDown(event, element)}
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(element.id)
            }}
          >
            {sampleForField(element.fieldId)}
          </div>
        )
      })}
    </div>
  )
}
