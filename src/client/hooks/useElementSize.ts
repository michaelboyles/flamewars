import { useLayoutEffect, useState } from 'react';

export function useElementSize(element: HTMLElement) {
    const [size, setSize] = useState({width: 0, height: 0});

    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => {
            setSize({
                width: element.getBoundingClientRect().width,
                height: element.getBoundingClientRect().height
            });
        });

        if (element) {
            observer.observe(element);
            return () => observer.unobserve(element);
        }
    }, [element]);

    return size;
}
