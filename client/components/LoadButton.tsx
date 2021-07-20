import * as React from 'react';
import { ReactNode, useState, ButtonHTMLAttributes } from 'react';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onclick'> {
    normalLabel?: ReactNode;
    loadingLabel?: ReactNode;
    load: () => Promise<any>;
}

export const LoadButton = (props: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const {
        normalLabel = 'Load more',
        loadingLabel = 'Loading...',
        load,
        ...buttonProps
    } = props;

    const onClick = async () => {
        setIsLoading(true);
        try {
            await load();
        }
        catch (err) {}
        setIsLoading(false);
    };

    return (
        <button onClick={onClick} {...buttonProps}>
            {isLoading ? loadingLabel : normalLabel}
        </button>
    );
}
