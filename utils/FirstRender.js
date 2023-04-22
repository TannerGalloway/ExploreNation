import { useRef, useEffect } from "react";

// Check if this is the first render of the app.
export default function useFirstRender() {
  const firstRender = useRef(false);

  useEffect(() => {
    firstRender.current = true;
  }, []);

  return firstRender.current;
}
