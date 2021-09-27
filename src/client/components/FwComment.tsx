import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { onlyAuthorization } from './SignIn';
import { AWS_GET_URL, DELETED_MESSAGE } from '../config';
import { CommentForm } from './CommentForm';
import { DefaultAvatar } from './DefaultAvatar';
import { Markdown } from './Markdown';
import { ShareButton } from './ShareButton';
import { AuthContext } from '../context/AuthContext';
import { UrlFragmentContext } from '../context/UrlFragmentContext';
import { If } from 'jsx-conditionals';
import { Votes } from './Votes';
import { encodedWindowUrl, formatFullTime, formatPastDate, isOwner } from '../util';
import { DownArrow } from './svg/DownArrow';
import { UpArrow } from './svg/UpArrow';
import { LoadButton } from './LoadButton';

import type { Comment, GetAllCommentsResponse } from '../../common/types/get-all-comments-response';

import './FwComment.scss';

const Timestamp = React.memo((props: {isoTimestamp: string}) => {
    const date = new Date(props.isoTimestamp);
    return (
        <time className='timestamp' dateTime={props.isoTimestamp} title={formatFullTime(date)}>{formatPastDate(date)}</time>
    )
});

const Portrait = (props: {username: string, url: string}) => {
    if (props.url) {
        return <img className='portrait' src={props.url} />;
    } 
    return <DefaultAvatar username={props.username} bgcolour='#fff' />;
};

interface Parent {
    comment: Comment;
    addReply: (comment: Comment) => void;
}

export const FwComment = (props: {comment: Comment, parent?: Parent}) => {
    const [replies, setReplies] = useState<Record<string, Comment>>({});
    const [nextUrl, setNextUrl] = useState(props.comment.replies.uri);

    const [isReplyFormOpen, setReplyFormOpen] = useState(false);
    const [isRepliesSectionOpen, setRepliesSectionOpen] = useState(false);
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

    const addReply = (reply: Comment) => {
        setReplies({...replies, [reply.id]: reply})
    };

    const deleteComment = () => {
        const shouldDelete = confirm('Are you sure you want to delete this comment?');
        if (!shouldDelete) return;
        fetch(`${AWS_GET_URL}/comments/${encodedWindowUrl()}/${props.comment.id}`,
            {
                method: 'DELETE',
                body: JSON.stringify({authorization: onlyAuthorization(authorization)}),
                headers: {'content-type': 'application/json'}
            })
            .then(response => { if (response.ok) { setDeleted(true); setIsEditing(false); } })
            .catch(e => console.error(e));
    };

    const afterSubmitNew = (comment: Comment) => {
        if (props.parent) {
            props.parent.addReply(comment);
        }
        else {
            addReply(comment);
        }
        setReplyFormOpen(false);
    };

    const afterSubmitEdit = (comment: Comment) => {
        setIsEditing(false);
        if (comment.text !== props.comment.text) {
            setText(comment.text);
            setIsEdited(true);
        }
    };

    const loadMoreReplies = async () => {
        if (!isRepliesSectionOpen && Object.keys(replies).length > 0) {
            setRepliesSectionOpen(true);
            return;
        }

        if (!nextUrl) return;
        const resp = await fetch(nextUrl);
        if (resp.ok) {
            const json = await resp.json() as GetAllCommentsResponse;
            setReplies({
                ...replies,
                ...json.comments.reduce((result, comment) => { return {...result, [comment.id]: comment}; }, {})
            });
            setRepliesSectionOpen(true);
            if (json.continuationToken) {
                setNextUrl(`${props.comment.replies.uri}?continuationToken=${json.continuationToken}`);
            }
            else {
                setNextUrl(undefined);
            }
        }
        else {
            console.error('Failed to load replies');
        }
    }

    const numReplies = props.comment?.replies?.count ?? 0;
    if (isDeleted && numReplies === 0 && Object.keys(replies).length === 0) return null;

    const id = 'comment-' + props.comment.id;
    const bodyClassName = 'body' + (fragment?.endsWith(props.comment.id) ? ' is-selected' : '');

    return (
        <li id={id} className='comment' role='comment' data-author={props.comment.author.name}>
            <Portrait username={props.comment.author.id} url={props.comment.author.portraitUrl}/>
            <div className={bodyClassName}>
                <span className='author-name'>{props.comment.author.name}</span>
                <Timestamp isoTimestamp={props.comment.timestamp} />
                <If condition={isEdited}>
                    <span className='edit-indicator'>Edited</span>
                </If>
                <If condition={Boolean(props.comment.inReplyTo?.author)}>
                    <span className='reply-to'>Replying to <a href={'#' + props.comment.inReplyTo.id}>{props.comment.inReplyTo.author}</a></span>
                </If>
                {
                    !isEditing ? 
                        <Markdown text={isDeleted ? DELETED_MESSAGE : text} /> :
                        <CommentForm commentToEdit={{...props.comment, text: text}} // In case the user already editted this comment once
                                     afterSubmit={afterSubmitEdit}
                                     buttonLabel='Save edit'
                                     type='edit'
                                     onCancel={() => setIsEditing(false)}
                        />
                }
                <If condition={!isDeleted}>
                    <Votes comment={props.comment} />
                </If>
                <button onClick={() => setReplyFormOpen(!isReplyFormOpen)} className={'reply-btn ' + (isReplyFormOpen ? 'open' : 'closed')}>Reply</button>
                <ShareButton className='share-btn' fragment={id} />
                <If condition={isOwner(authorization, props.comment) && !isDeleted}>
                    <button className='edit-btn' onClick={() => setIsEditing(!isEditing)}>Edit</button>
                    <button className='delete-btn' onClick={deleteComment}>Delete</button>
                </If>
            </div>
            <If condition={isReplyFormOpen}>
                <CommentForm
                    afterSubmit={afterSubmitNew}
                    threadId={props.parent?.comment?.id ?? props.comment.id}
                    inReplyTo={props.comment.id}
                    type='reply'
                    onCancel={() => setReplyFormOpen(false)}
                />
            </If>
            <If condition={isRepliesSectionOpen}>
                <button className='hide-replies' onClick={() => setRepliesSectionOpen(false)}>
                    <UpArrow />Hide {repliesToStr(numReplies)}
                </button>
                <ul className='replies'>{
                    Object.values(replies)
                        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                        .map(reply =>
                            <FwComment
                                key={reply.id}
                                comment={reply}
                                parent={{
                                    comment: props.comment,
                                    addReply
                                }}
                            />
                        )
                }</ul>
            </If>
            <LoadButton
                className='view-replies'
                load={loadMoreReplies}
                normalLabel={
                    <>
                        <DownArrow />
                        { isRepliesSectionOpen ? 'Show more replies': `View ${repliesToStr(numReplies)}` }
                    </>
                }
                loadingLabel={<><DownArrow />Loading...</>}
                visible={numReplies > 0 && (!isRepliesSectionOpen || !!nextUrl)}
            />
        </li>
    );
};

function repliesToStr(numReplies: number) {
    return numReplies === 1 ? 'reply' : (numReplies + ' replies');
}
