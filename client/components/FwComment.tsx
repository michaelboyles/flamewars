import * as React from 'react';
import { useState } from 'react';
import { LocalAuthorization } from './SignIn';
import type { Comment } from '../../dist/get-all-comments-response'
import { AWS_GET_URL, DELETED_MESSAGE } from '../../config';
import { formatPastDate } from '../time';
import { ReplyForm } from './ReplyForm';

function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return authorization && comment.author.id.endsWith(authorization.id);
}

export const FwComment = (props: {comment: Comment, authorization: LocalAuthorization}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(false);

    const deleteComment = () => {
        fetch(AWS_GET_URL + `?url=${encodeURIComponent(window.location.toString())}&commentId=${encodeURIComponent(props.comment.id)}`, { method: 'DELETE' })
            .then(response => { if (response.ok) setDeleted(true); })
            .catch(e => console.log(e));
    }

    if (isDeleted && !replies.length) return null;

    const text = isDeleted ? DELETED_MESSAGE : props.comment.text;
    return (
        <li className='comment'>
            <img className='portrait' src={props.comment.author.portraitUrl ? props.comment.author.portraitUrl : 'https://via.placeholder.com/100x100' } />
            <div className='body'>
                <span className='author-name'>{props.comment.author.name}</span>
                <span className='timestamp'>{formatPastDate(Date.parse(props.comment.timestamp))}</span>
                { isOwner(props.authorization, props.comment) ?<a onClick={() => deleteComment()}>Delete</a> : null }
                <span className='content'>{text}</span>
                <a onClick={() => setReplyOpen(!isReplyOpen)} className={isReplyOpen ? 'open' : 'closed'}>Reply</a>
                {
                    isReplyOpen ? <ReplyForm authorization={props.authorization}
                                             afterSubmit={comment => { setReplies(replies.concat(comment)); setReplyOpen(false); }}
                                             inReplyTo={props.comment.id} />
                                : null
                }
                {
                    replies.length ?
                        <ul>{ replies.map(reply => <FwComment comment={reply} authorization={props.authorization} />) }</ul>
                        :
                        null
                }
            </div>
        </li>
    );
}
