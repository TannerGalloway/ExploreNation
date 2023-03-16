import { useRef, useEffect } from "react";

// Check if this is the first render of the app.
export default function useFirstRender() {
  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  return firstRender.current;
}
