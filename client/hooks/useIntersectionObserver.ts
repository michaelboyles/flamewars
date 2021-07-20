import { RefObject, useEffect, useState } from 'react'

function useIntersectionObserver(elementRef: RefObject<Element>): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) return;

    const observer = new IntersectionObserver(entries => setEntry(entries[0]));
    observer.observe(node);

    return () => observer.disconnect()
  }, [elementRef]);

  return entry;
}

export { useIntersectionObserver }
