import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

/**
 * A hook to determine if the current viewport is a mobile device.
 * This implementation is safe for Server-Side Rendering (SSR). It defaults
 * to `false` on the server and then updates to the correct value on the client
 * after mounting, preventing hydration errors.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Set the initial value on the client
    setIsMobile(mql.matches)

    // Update the value whenever the media query match status changes
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    mql.addEventListener("change", onChange)

    // Clean up the event listener when the component unmounts
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, []) // The empty dependency array ensures this effect runs only once on mount.

  return isMobile
}
