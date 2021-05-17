import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { LocalAuthorization, onlyAuthorization } from './SignIn';
import type { Comment } from '../../common/types/get-all-comments-response';
import { AWS_GET_URL, DELETED_MESSAGE } from '../config';
import { formatPastDate, formatFullTime } from '../time';
import CommentForm from './CommentForm';
import DefaultAvatar from './DefaultAvatar';
import Markdown from './Markdown';
import { ShareButton } from './ShareButton';
import { AuthContext } from '../context/AuthContext';
import { UrlFragmentContext } from '../context/UrlFragmentContext';
import { If } from './If';

import './FwComment.scss';

function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return (!!authorization) && comment.author.id.endsWith(authorization.id);
};

const Timestamp = (props: {timestamp: Date}) => {
    const isoTimestamp = props.timestamp.toISOString();
    return (
        <time className='timestamp' dateTime={isoTimestamp} title={formatFullTime(props.timestamp)}>{formatPastDate(props.timestamp)}</time>
    )
};

const Portrait = (props: {username: string, url: string}) => {
    if (props.url) {
        return <img className='portrait' src={props.url} />;
    } 
    return <DefaultAvatar username={props.username} bgcolour='#fff' />;
};

const FwComment = (props: {comment: Comment}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(props.comment.status === 'deleted');
    const [isEditing, setIsEditing] = useState(false);
    const [isEdited, setIsEdited] = useState(props.comment.status === 'edited');
    const [text, setText] = useState(props.comment.text);
    const { authorization } = useContext(AuthContext);
    const { fragment } = useContext(UrlFragmentContext);

    useEffect(() => {
        // If user logs out mid-edit then reset edit state
        if (!authorization && isEditing) {
            setIsEditing(false);
        }
    }, [authorization, isEditing]);

    const deleteComment = () => {
        const shouldDelete = confirm('Are you sure you want to delete this comment?');
        if (!shouldDelete) return;
        fetch(`${AWS_GET_URL}/comments/${encodeURIComponent(window.location.toString())}/${props.comment.id}`,
            {
                method: 'DELETE',
                body: JSON.stringify({authorization: onlyAuthorization(authorization)}),
                headers: {'content-type': 'application/json'}
            })
            .then(response => { if (response.ok) { setDeleted(true); setIsEditing(false); } })
            .catch(e => console.error(e));
    };

    const afterSubmitEdit = (comment: Comment) => {
        setIsEditing(false);
        if (comment.text !== props.comment.text) {
            setText(comment.text);
            setIsEdited(true);
        }
    };

    if (isDeleted && !replies.length) return null;

    const id = 'comment-' + props.comment.id;
    const bodyClassName = 'body' + (fragment?.endsWith(props.comment.id) ? ' is-selected' : '');

    return (
        <li id={id} className='comment' role='comment' data-author={props.comment.author.name}>
            <Portrait username={props.comment.author.id} url={props.comment.author.portraitUrl}/>
            <div className={bodyClassName}>
                <span className='author-name'>{props.comment.author.name}</span>
                <Timestamp timestamp={new Date(props.comment.timestamp)} />
                <If condition={isEdited}>
                    <span className='edit-indicator'>Edited</span>
                </If>
                {
                    !isEditing ? 
                        <Markdown text={isDeleted ? DELETED_MESSAGE : text} /> :
                        <CommentForm commentToEdit={{...props.comment, text: text}} // In case the user already editted this comment once
                                     afterSubmit={afterSubmitEdit}
                                     buttonLabel='Save edit'
                                     type='edit'
                        />
                }
                <button onClick={() => setReplyOpen(!isReplyOpen)} className={'reply-btn ' + (isReplyOpen ? 'open' : 'closed')}>Reply</button>
                <ShareButton className='share-btn' fragment={id} />
                <If condition={isOwner(authorization, props.comment) && !isDeleted}>
                    <button className='edit-btn' onClick={() => setIsEditing(!isEditing)}>Edit</button>
                    <button className='delete-btn' onClick={deleteComment}>Delete</button>
                </If>
            </div>
            <If condition={isReplyOpen}>
                <CommentForm
                    afterSubmit={comment => { setReplies(replies.concat(comment)); setReplyOpen(false); }}
                    inReplyTo={props.comment.id}
                    type='reply'
                />
            </If>
            <If condition={Boolean(replies?.length)}>
                <ul className='replies'>{
                    replies
                        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                        .map(reply => <FwComment key={reply.id} comment={reply} />)
                }</ul>
            </If>
        </li>
    );
};

export default FwComment;
