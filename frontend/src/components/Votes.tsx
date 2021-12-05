import React from 'react';
import { useContext, useState } from 'react';
import { onlyAuthorization } from './SignIn';
import { AWS_GET_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { encodedWindowUrl, isOwner } from '../util';
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
    const { authorization } = useContext(AuthContext);
    const [votes, setVotes] = useState(props.comment.votes);

    let myVote = undefined;
    if (votes.upvoters.includes(authorization?.fullId)) myVote = 'up';
    if (votes.downvoters.includes(authorization?.fullId)) myVote = 'down';

    const vote = (voteType: 'up' | 'down') => {
        const voteBody: VoteRequest = {
            authorization: onlyAuthorization(authorization),
            voteType
        };
        doFetch(voteBody, props.comment.id);

        let newUpvoters = votes.upvoters;
        let newDownvoters = votes.downvoters;
        if (voteType === 'up') {
            newUpvoters = newUpvoters.concat(authorization?.fullId);
            newDownvoters = newDownvoters.filter(id => id !== authorization?.fullId);
        }
        if (voteType === 'down') {
            newDownvoters = newDownvoters.concat(authorization?.fullId);
            newUpvoters = newUpvoters.filter(id => id !== authorization?.fullId);
        }
        setVotes({
            upvoters: newUpvoters,
            downvoters: newDownvoters
        });
    };

    const removeVote = () => {
        const voteBody: VoteRequest = {
            authorization: onlyAuthorization(authorization),
            voteType: 'none'
        };
        doFetch(voteBody, props.comment.id);

        setVotes({
            upvoters: votes.upvoters.filter(id => id !== authorization?.fullId),
            downvoters: votes.downvoters.filter(id => id !== authorization?.fullId)
        });
    };

    const onUpClick = () => (myVote === 'up') ? removeVote() : vote('up');
    const onDownClick = () => (myVote === 'down') ? removeVote() : vote('down');

    const upvoteLabel = (myVote === 'up') ? 'Remove like' : 'Like'; 
    const downvoteLabel = (myVote === 'down') ? 'Remove dislike' : 'Dislike';
    
    const ownerOrNotSignedIn = !authorization || isOwner(authorization, props.comment);
    return (
        <div className='votes'>
            <span className={'upvotes' + (myVote === 'up' ? myVoteClass : '')}>
                <button onClick={onUpClick} disabled={ownerOrNotSignedIn} aria-label={upvoteLabel} title={upvoteLabel}>
                    <HiOutlineThumbUp />
                </button>
                {votes.upvoters.length}
            </span>
            <span className={'downvotes' + (myVote === 'down' ? myVoteClass : '')}>
                <button onClick={onDownClick} disabled={ownerOrNotSignedIn} aria-label={downvoteLabel} title={downvoteLabel}>
                    <HiOutlineThumbDown />
                </button>
                {votes.downvoters.length}
            </span>
        </div>
    );
};
