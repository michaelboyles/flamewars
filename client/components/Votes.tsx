import * as React from 'react';
import { useContext, useState } from 'react';
import { onlyAuthorization } from './SignIn';
import { AWS_GET_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { isOwner } from '../util';

import type { VoteRequest } from '../../common/types/vote';
import type { Comment } from '../../common/types/get-all-comments-response';

import './Votes.scss';

const myVoteClass = 'my-vote';

export const Votes = (props: {comment: Comment}) => {
    const { authorization } = useContext(AuthContext);
    const [votes, setVotes] = useState(props.comment.votes);

    const vote = (voteType: 'up' | 'down' | 'none') => {
        const voteBody: VoteRequest = {
            authorization: onlyAuthorization(authorization),
            voteType
        };
        fetch(`${AWS_GET_URL}/comments/${encodeURIComponent(window.location.toString())}/${props.comment.id}/votes`,
            {
                method: 'PATCH',
                body: JSON.stringify(voteBody),
                headers: {'content-type': 'application/json'}
            }
        );
        setVotes({
            up: 9,
            down: 9,

        });
    };

    const ownerOrNotSignedIn = !authorization || isOwner(authorization, props.comment);
    const myVote = props.comment.votes?.myVote;
    return (
        <div className='votes'>
            <span className={'upvotes ' + (myVote === 'up' ? myVoteClass : '')}>
                <button onClick={() => vote('up')} disabled={myVote === 'up' || ownerOrNotSignedIn} aria-label='Upvote' title='Like'>
                    ⇧
                </button>
                {props.comment.votes.up}
            </span>
            <span className={'downvotes ' + (myVote === 'down' ? myVoteClass : '')}>
                <button onClick={() => vote('down')} disabled={myVote === 'down' || ownerOrNotSignedIn} aria-label='Downvote' title='Dislike'>
                    ⇩
                </button>
                {props.comment.votes.down}
            </span>
        </div>
    );
};
