import React from 'react';
import { Fragment, ReactNode } from 'react';

interface Props {
    condition: boolean;
    children: ReactNode;
}

export const If = (props: Props) => { 
    return (
        <Fragment>
            {props.condition ? props.children : null}
        </Fragment>
    );
}
