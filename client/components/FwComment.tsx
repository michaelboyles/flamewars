import * as React from 'react';
import { useState } from 'react';
import { LocalAuthorization } from './SignIn';
import type { Comment } from '../../dist/get-all-comments-response'
import { AWS_GET_URL, DELETED_MESSAGE } from '../../config';
import { formatPastDate } from '../time';
import ReplyForm from './ReplyForm';
import DefaultAvatar from './DefaultAvatar';
import ReactMarkdown = require('react-markdown');

function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return authorization && comment.author.id.endsWith(authorization.id);
}

function addAutoLinks(comment: string) : string {
    return comment.replace(/((?<!]\()https?:\/\/[^\s)]+)/gi, '[$1]($1)');
}

const FwComment = (props: {comment: Comment, authorization: LocalAuthorization}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(false);

    const deleteComment = () => {
        fetch(AWS_GET_URL + `?url=${encodeURIComponent(window.location.toString())}&commentId=${encodeURIComponent(props.comment.id)}`, { method: 'DELETE' })
            .then(response => { if (response.ok) setDeleted(true); })
            .catch(e => console.log(e));
    }

    if (isDeleted && !replies.length) return null;

    const text = isDeleted ? DELETED_MESSAGE : addAutoLinks(props.comment.text);
    return (
        <li className='comment'>
            {
                props.comment.author.portraitUrl ? <img className='portrait' src={props.comment.author.portraitUrl} /> : <DefaultAvatar colour='#222' />
            }
            <div className='body'>
                <span className='author-name'>{props.comment.author.name}</span>
                <span className='timestamp'>{formatPastDate(Date.parse(props.comment.timestamp))}</span>
                { isOwner(props.authorization, props.comment) ?<a className='delete-btn' onClick={() => deleteComment()}>Delete</a> : null }
                <ReactMarkdown className='content'>{text}</ReactMarkdown>
                <a onClick={() => setReplyOpen(!isReplyOpen)} className={'reply-btn ' + (isReplyOpen ? 'open' : 'closed')}>Reply</a>
                {
                    isReplyOpen ? <ReplyForm authorization={props.authorization}
                                             afterSubmit={comment => { setReplies(replies.concat(comment)); setReplyOpen(false); }}
                                             inReplyTo={props.comment.id} />
                                : null
                }
                {
                    replies.length ?
                        <ul>{ replies
                                .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                                .map(reply => <FwComment key={reply.id} comment={reply} authorization={props.authorization} />) }</ul>
                        :
                        null
                }
            </div>
        </li>
    );
}

export default FwComment;
