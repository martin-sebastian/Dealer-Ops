/** CSS pixels per inch used to size the designer canvas. */
export const DPI = 96

/** Grid step in inches for optional snap-while-dragging. */
export const GRID_IN = 0.125

export type PageSize = {
  id: string
  /** Display name only. Not stored as a template type. */
  label: string
  widthIn: number
  heightIn: number
}

/**
 * Unique page sizes. Hang tag, spec sheet, and brochure all use 8.5×11;
 * those words are template names, not stored types.
 */
export const PAGE_SIZES: PageSize[] = [
  { id: "key-tag-small", label: "3.5 × 2 in", widthIn: 3.5, heightIn: 2 },
  {
    id: "key-tag-vertical",
    label: "2.125 × 3.375 in",
    widthIn: 2.125,
    heightIn: 3.375,
  },
  { id: "letter", label: "8.5 × 11 in", widthIn: 8.5, heightIn: 11 },
]

export const DEFAULT_PAGE_SIZE = PAGE_SIZES[2]

/** Returns true when the page is US Letter (hang tag / spec / brochure). */
export function isLetterPage(widthIn: number, heightIn: number) {
  const letter =
    (widthIn === 8.5 && heightIn === 11) || (widthIn === 11 && heightIn === 8.5)
  return letter
}

/** Snaps an inch value to the designer grid. */
export function snapInches(value: number) {
  return Math.round(value / GRID_IN) * GRID_IN
}

/** Converts inches to canvas pixels. */
export function inchesToPx(inches: number) {
  return inches * DPI
}
