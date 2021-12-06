import React from 'react';
import { useContext, useState } from 'react';
import { AWS_GET_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { encodedWindowUrl } from '../util';
import { HiOutlineThumbDown, HiOutlineThumbUp } from 'react-icons/hi'

import type { VoteRequest } from '../../../common/types/vote';
import type { Comment } from '../../../common/types/get-all-comments-response';

import './Votes.scss';

const myVoteClass = ' my-vote';

const doFetch = (voteBody: VoteRequest, commentId: string) => {
    fetch(`${AWS_GET_URL}/comments/${encodedWindowUrl()}/${commentId}/votes`, {
        method: 'PATCH',
        body: JSON.stringify(voteBody),
        headers: {'content-type': 'application/json'}
    });
};

export const Votes = (props: {comment: Comment}) => {
    const { authorization, user } = useContext(AuthContext);
    const [votes, setVotes] = useState(props.comment.votes);

    let myVote = undefined;
    if (votes.upvoters.includes(user?.id)) myVote = 'up';
    if (votes.downvoters.includes(user?.id)) myVote = 'down';

    const vote = (voteType: 'up' | 'down') => {
        const voteBody: VoteRequest = {
            authorization,
            voteType
        };
        doFetch(voteBody, props.comment.id);

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
    };

    const removeVote = () => {
        const voteBody: VoteRequest = {
            authorization,
            voteType: 'none'
        };
        doFetch(voteBody, props.comment.id);

        setVotes({
            upvoters: votes.upvoters.filter(id => id !== user?.id),
            downvoters: votes.downvoters.filter(id => id !== user?.id)
        });
    };

    const onUpClick = () => (myVote === 'up') ? removeVote() : vote('up');
    const onDownClick = () => (myVote === 'down') ? removeVote() : vote('down');

    const upvoteLabel = (myVote === 'up') ? 'Remove like' : 'Like'; 
    const downvoteLabel = (myVote === 'down') ? 'Remove dislike' : 'Dislike';
    
    const ownerOrNotSignedIn = !authorization || props.comment.author.id === user?.id;
    return (
        <div className='votes'>
            <button className={myVote === 'up' ? myVoteClass : ''} onClick={onUpClick} disabled={ownerOrNotSignedIn} aria-label={upvoteLabel} title={upvoteLabel}>
                <HiOutlineThumbUp />
            </button>
            {votes.upvoters.length - votes.downvoters.length}
            <button className={myVote === 'down' ? myVoteClass : ''} onClick={onDownClick} disabled={ownerOrNotSignedIn} aria-label={downvoteLabel} title={downvoteLabel}>
                <HiOutlineThumbDown />
            </button>
        </div>
    );
};
