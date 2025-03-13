import { useState } from 'react';
import { AWS_GET_URL } from '../config';
import { useAuthContext } from '../context/AuthContext';
import { encodedWindowUrl } from '../util';
import { HiOutlineThumbDown, HiOutlineThumbUp } from 'react-icons/hi'

import type { VoteRequest } from '../../../common/types/vote';
import type { Comment } from '../../../common/types/get-all-comments-response';

import './Votes.scss';

const myVoteClass = ' my-vote';

export type Props = {
    comment: Comment
}
export function Votes({ comment }: Props) {
    const { authorization, user } = useAuthContext();
    const [votes, setVotes] = useState(comment.votes);

    let myVote = undefined;
    if (votes.upvoters.includes(user?.id)) myVote = 'up';
    if (votes.downvoters.includes(user?.id)) myVote = 'down';

    function vote(voteType: 'up' | 'down') {
        const voteBody: VoteRequest = {
            authorization,
            voteType
        };
        doFetch(voteBody, comment.id);

        let newUpvoters = votes.upvoters;
        let newDownvoters = votes.downvoters;
        if (voteType === 'up') {
            newUpvoters = newUpvoters.concat(user?.id);
            newDownvoters = newDownvoters.filter(id => id !== user?.id);
        }
        if (voteType === 'down') {
            newDownvoters = newDownvoters.concat(user?.id);
            newUpvoters = newUpvoters.filter(id => id !== user?.id);
        }
        setVotes({
            upvoters: newUpvoters,
            downvoters: newDownvoters
        });
    }

    function removeVote() {
        const voteBody: VoteRequest = {
            authorization,
            voteType: 'none'
        };
        doFetch(voteBody, comment.id);

        setVotes({
            upvoters: votes.upvoters.filter(id => id !== user?.id),
            downvoters: votes.downvoters.filter(id => id !== user?.id)
        });
    }

    function onUpClick() {
        (myVote === 'up') ? removeVote() : vote('up');
    }
    function onDownClick() {
        (myVote === 'down') ? removeVote() : vote('down');
    }

    const upvoteLabel = (myVote === 'up') ? 'Remove like' : 'Like'; 
    const downvoteLabel = (myVote === 'down') ? 'Remove dislike' : 'Dislike';
    
    const ownerOrNotSignedIn = !authorization || comment.author.id === user?.id;
    return (
        <div className='votes'>
            <button className={myVote === 'up' ? myVoteClass : ''} onClick={onUpClick} disabled={ownerOrNotSignedIn} aria-label={upvoteLabel} title={upvoteLabel}>
                <HiOutlineThumbUp />
            </button>
            <span className='score'>{votes.upvoters.length - votes.downvoters.length}</span>
            <button className={myVote === 'down' ? myVoteClass : ''} onClick={onDownClick} disabled={ownerOrNotSignedIn} aria-label={downvoteLabel} title={downvoteLabel}>
                <HiOutlineThumbDown />
            </button>
        </div>
    );
}

function doFetch(voteBody: VoteRequest, commentId: string) {
    return fetch(`${AWS_GET_URL}/comments/${encodedWindowUrl()}/${commentId}/votes`, {
        method: 'PATCH',
        body: JSON.stringify(voteBody),
        headers: {'content-type': 'application/json'}
    });
}