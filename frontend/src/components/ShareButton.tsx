import { useState } from 'react';
import { If } from 'jsx-conditionals';

type Props = {
    fragment: string
    className?: string
}
export function ShareButton({ className, fragment }: Props) {
    const [isShowingCopied, setShowingCopied] = useState(false);

    async function share() {
        window.location.href = '#' + fragment;
        await navigator.clipboard.writeText(window.location.href);
        setShowingCopied(true);
        setTimeout(() => setShowingCopied(false), 1_000);
    }

    return (
        <button onClick={() => share()} className={className}>
            Share
            <If condition={isShowingCopied}>
                <div className='copied'>Link copied</div>
            </If>
        </button>
    )
}
