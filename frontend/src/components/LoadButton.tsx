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

    async function loadComments() {
        setIsLoading(true);
        try {
            await load();
        }
        catch (err) {}
        setIsLoading(false);
    }

    return (
        <button onClick={() => loadComments()} {...buttonProps}>
            {isLoading ? loadingLabel : normalLabel}
        </button>
    )
}
