import React from 'react';
import { useState } from 'react';
import { If } from './If';

interface Props {
    className?: string;
    fragment: string;
}

export const ShareButton = (props: Props) => {
    const [isShowingCopied, setShowingCopied] = useState(false);

    const onClick = () => { 
        window.location.href = '#' + props.fragment;
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setShowingCopied(true);
                setTimeout(() => setShowingCopied(false), 1000);
            });
    };

    return (
        <button onClick={onClick} className={props.className}>
            Share
            <If condition={isShowingCopied}>
                <div className='copied'>Link copied</div>
            </If>
        </button>
    )
};
