import * as React from 'react';
import { useState } from 'react';
import { LocalAuthorization, onlyAuthorization } from './SignIn';
import type { Comment } from '../../common/types/get-all-comments-response'
import { AWS_GET_URL, DELETED_MESSAGE } from '../../config';
import { formatPastDate, formatFullTime } from '../time';
import CommentForm from './CommentForm';
import DefaultAvatar from './DefaultAvatar';
import ReactMarkdown = require('react-markdown');

function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return (!!authorization) && comment.author.id.endsWith(authorization.id);
}

function addAutoLinks(comment: string) : string {
    return comment.replace(/((?<!]\()https?:\/\/[^\s)]+)/gi, '[$1]($1)');
}

const Timestamp = (props: {timestamp: number}) => {
    return (
        <span className='timestamp' title={formatFullTime(props.timestamp)}>{formatPastDate(props.timestamp)}</span>
    )
}

const EditIndicator = (props: {isEdited: boolean}) => {
    if (!props.isEdited) return null;
    return <span className='edit-indicator'>Edited</span>
}

const OwnerActions = (props: {isOwner: boolean, onEdit: () => void, onDelete: () => void}) => {
    if (!props.isOwner) return null;
    return (
        <>
            <a className='edit-btn' onClick={props.onEdit}>Edit</a>
            <a className='delete-btn' onClick={props.onDelete}>Delete</a>
        </>
    )
}

const Portrait = (props: {username: string, url: string}) => {
    if (props.url) {
        return <img className='portrait' src={props.url} />;
    } 
    return <DefaultAvatar username={props.username} bgcolour='#fff' />;
}

const FwComment = (props: {comment: Comment, authorization: LocalAuthorization}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEdited, setIsEdited] = useState(props.comment.isEdited);
    const [text, setText] = useState(props.comment.text);

    const deleteComment = () => {
        const shouldDelete = confirm('Are you sure you want to delete this comment?');
        if (!shouldDelete) return;
        fetch(`${AWS_GET_URL}/${encodeURIComponent(window.location.toString())}/${props.comment.id}`,
            {
                method: 'DELETE',
                body: JSON.stringify({authorization: onlyAuthorization(props.authorization)})
            })
            .then(response => { if (response.ok) setDeleted(true); })
            .catch(e => console.error(e));
    }

    if (isDeleted && !replies.length) return null;

    return (
        <li className='comment'>
            <Portrait username={props.comment.author.id} url={props.comment.author.portraitUrl}/>
            <div className='body'>
                <span className='author-name'>{props.comment.author.name}</span>
                <Timestamp timestamp={Date.parse(props.comment.timestamp)} />
                <EditIndicator isEdited={isEdited} />
                {
                    !isEditing ? 
                        <ReactMarkdown className='content'>{addAutoLinks(isDeleted ? DELETED_MESSAGE : text)}</ReactMarkdown> :
                        <CommentForm authorization={props.authorization}
                                     initialText={text}
                                     afterSubmit={comment => { setText(comment.text); setIsEditing(false); setIsEdited(true);  }}
                                     buttonLabel='Save edit'
                                     type='EDIT'
                                     commentId={props.comment.id}
                        />
                }
                <a onClick={() => setReplyOpen(!isReplyOpen)} className={'reply-btn ' + (isReplyOpen ? 'open' : 'closed')}>Reply</a>
                <OwnerActions isOwner={isOwner(props.authorization, props.comment)}
                              onEdit={() => setIsEditing(!isEditing)}
                              onDelete={deleteComment} />
                {
                    isReplyOpen ? <CommentForm authorization={props.authorization}
                                               afterSubmit={comment => { setReplies(replies.concat(comment)); setReplyOpen(false); }}
                                               inReplyTo={props.comment.id}
                                               type='REPLY' />
                                : null
                }
            </div>
            <ul className='replies'>{
                !replies.length ? null : 
                    replies
                        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                        .map(reply => <FwComment key={reply.id} comment={reply} authorization={props.authorization} />)
            }</ul>
        </li>
    );
}

export default FwComment;
