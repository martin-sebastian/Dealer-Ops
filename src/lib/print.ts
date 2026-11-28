import { isLetterPage } from "@/data/page-sizes"

export type LetterZoom = 1 | 0.5 | 0.666 | 1.25

/** Preview zoom for small labels is always 2×; print stays 1×. */
export function previewZoomForPage(widthIn: number, heightIn: number) {
  if (isLetterPage(widthIn, heightIn)) {
    return 1 as LetterZoom
  }
  return 2
}

/** True when the hang-tag zoom choices (full / half / two-thirds / peek) apply. */
export function usesLetterZoom(widthIn: number, heightIn: number) {
  return isLetterPage(widthIn, heightIn)
}

/** Opens the OS print dialog so the user can pick an installed printer or Save as PDF. */
export function sendToPrinter() {
  window.print()
}
