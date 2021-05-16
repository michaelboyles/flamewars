import React = require('react');
import { createContext, ReactNode, useEffect, useState } from 'react';

interface IUrlFragmentContext {
    fragment?: string;
};

export const UrlFragmentContext = createContext<IUrlFragmentContext>({});

export const UrlFragmentContextProvider = (props: {children: ReactNode}) => {
    const [fragment, setFragment] = useState(window.location.hash);

    useEffect(() => {
        window.addEventListener('hashchange', () => setFragment(window.location.hash), false);
    }, []);

    return (
        <UrlFragmentContext.Provider value={{ fragment }}>
            {props.children}
        </UrlFragmentContext.Provider>
    );
}
