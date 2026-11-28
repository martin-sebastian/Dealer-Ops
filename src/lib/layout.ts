import { getField } from "@/data/fields"
import { DEFAULT_PAGE_SIZE } from "@/data/page-sizes"

export type TextElement = {
  id: string
  kind: "text"
  fieldId: string
  x: number
  y: number
  fontSize: number
  bold: boolean
  color: string
  snap: boolean
}

export type ImageElement = {
  id: string
  kind: "image"
  fieldId: string
  x: number
  y: number
  width: number
  height: number
  snap: boolean
}

export type LayoutElement = TextElement | ImageElement

export type PrintTemplate = {
  id: string
  name: string
  pageWidthIn: number
  pageHeightIn: number
  backgroundUrl: string
  elements: LayoutElement[]
  updatedAt: string
}

/** Creates a blank named template at the given page size. */
export function createTemplate(
  name = "Untitled",
  widthIn = DEFAULT_PAGE_SIZE.widthIn,
  heightIn = DEFAULT_PAGE_SIZE.heightIn
): PrintTemplate {
  return {
    id: crypto.randomUUID(),
    name,
    pageWidthIn: widthIn,
    pageHeightIn: heightIn,
    backgroundUrl: "",
    elements: [],
    updatedAt: new Date().toISOString(),
  }
}

/** Builds a text element bound to a catalog field. */
export function createTextElement(
  fieldId: string,
  x: number,
  y: number
): TextElement {
  return {
    id: crypto.randomUUID(),
    kind: "text",
    fieldId,
    x,
    y,
    fontSize: 14,
    bold: false,
    color: "#111111",
    snap: false,
  }
}

/** Builds an image element bound to a CDN URL field. */
export function createImageElement(
  fieldId: string,
  x: number,
  y: number
): ImageElement {
  return {
    id: crypto.randomUUID(),
    kind: "image",
    fieldId,
    x,
    y,
    width: 2,
    height: 1.5,
    snap: false,
  }
}

/** Resolves the sample value shown on the canvas for a field. */
export function sampleForField(fieldId: string) {
  return getField(fieldId)?.sample ?? fieldId
}

/** Returns a short page-size label for lists and filters. */
export function pageSizeLabel(template: PrintTemplate) {
  return `${template.pageWidthIn} × ${template.pageHeightIn} in`
}

/** Clamps one element's origin so a usable slice stays on the page. */
export function clampPositionToPage(
  element: LayoutElement,
  x: number,
  y: number,
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

/** Keeps a usable slice of each element on the page after a size change. */
export function clampElementsToPage(
  elements: LayoutElement[],
  widthIn: number,
  heightIn: number
) {
  const used = new Set<string>()

  /** Picks a free slot so two fields do not land on the same point. */
  function stagger(x: number, y: number) {
    let nextX = x
    let nextY = y
    for (let step = 0; step < 12; step += 1) {
      const key = `${nextX.toFixed(2)},${nextY.toFixed(2)}`
      if (!used.has(key)) {
        used.add(key)
        return { x: nextX, y: nextY }
      }
      nextY = Math.max(0, y - 0.4 * (step + 1))
      nextX = Math.max(0, x - 0.15 * (step + 1))
    }
    used.add(`${nextX.toFixed(2)},${nextY.toFixed(2)}`)
    return { x: nextX, y: nextY }
  }

  return elements.map((element) => {
    const clamped = clampPositionToPage(
      element,
      element.x,
      element.y,
      widthIn,
      heightIn
    )
    const slot = stagger(clamped.x, clamped.y)
    if (element.kind === "image") {
      return {
        ...element,
        ...slot,
        width: Math.min(element.width, Math.max(0.25, widthIn - slot.x)),
        height: Math.min(element.height, Math.max(0.25, heightIn - slot.y)),
      }
    }
    return { ...element, ...slot }
  })
}
