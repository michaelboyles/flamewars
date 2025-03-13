import { ReactNode, useState, ButtonHTMLAttributes } from 'react';

type Props = {
    normalLabel?: ReactNode;
    loadingLabel?: ReactNode;
    visible?: boolean;
    load: () => Promise<any>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onclick'>

export function LoadButton(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const {
        normalLabel = 'Load more',
        loadingLabel = 'Loading...',
        load,
        visible = true,
        ...buttonProps
    } = props;

    if (!visible) return null;

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
    )
}
