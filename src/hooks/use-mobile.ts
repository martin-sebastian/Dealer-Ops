import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768

/** Subscribes to the mobile breakpoint media query. */
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/** Reads whether the viewport is below the mobile breakpoint. */
function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

/** SSR/prerender snapshot; the client always re-reads the real width. */
function getServerSnapshot() {
  return false
}

/** True when the viewport is narrower than the sidebar mobile breakpoint. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
