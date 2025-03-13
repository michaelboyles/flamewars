import { memo, useState, useContext, useEffect } from 'react';
import { AWS_GET_URL, DELETED_MESSAGE } from '../config';
import { CommentForm } from './CommentForm';
import { DefaultAvatar } from './DefaultAvatar';
import { Markdown } from './Markdown';
import { ShareButton } from './ShareButton';
import { useAuthContext } from '../context/AuthContext';
import { UrlFragmentContext } from '../context/UrlFragmentContext';
import { Else, If } from 'jsx-conditionals';
import { Votes } from './Votes';
import { encodedWindowUrl, formatFullTime, formatPastDate } from '../util';
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go'
import { LoadButton } from './LoadButton';

import type { Comment, GetAllCommentsResponse } from '../../../common/types/get-all-comments-response';

import './FwComment.scss';

const Timestamp = memo((props: { isoTimestamp: string }) => {
    const date = new Date(props.isoTimestamp);
    return (
        <time className='timestamp' dateTime={props.isoTimestamp} title={formatFullTime(date)}>{formatPastDate(date)}</time>
    )
});

type PortraitProps = {
    username: string
    url: string
}
function Portrait({ username, url }: PortraitProps) {
    if (url) {
        return <img className='portrait' src={url} />;
    } 
    return <DefaultAvatar username={username} bgcolour='#fff' />;
}

type Props = {
    comment: Comment
    parent?: {
        comment: Comment
        addReply: (comment: Comment) => void
    }
}
export function FwComment({ comment, parent }: Props) {
    const [replies, setReplies] = useState<Record<string, Comment>>({});
    const [nextUrl, setNextUrl] = useState(comment.replies.uri);

    const [isReplyFormOpen, setReplyFormOpen] = useState(false);
    const [isRepliesSectionOpen, setRepliesSectionOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(comment.status === 'deleted');
    const [isEditing, setIsEditing] = useState(false);
    const [isEdited, setIsEdited] = useState(comment.status === 'edited');
    const [text, setText] = useState(comment.text);
    const [numReplies, setNumReplies] = useState(comment.replies?.count ?? 0);
    const { authorization, user } = useAuthContext();
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
        fetch(`${AWS_GET_URL}/comments/${encodedWindowUrl()}/${comment.id}`,
            {
                method: 'DELETE',
                body: JSON.stringify({authorization}),
                headers: {'content-type': 'application/json'}
            })
            .then(response => { if (response.ok) { setDeleted(true); setIsEditing(false); } })
            .catch(e => console.error(e));
    };

    const afterSubmitNew = (comment: Comment) => {
        if (parent) {
            parent.addReply(comment);
        }
        else {
            addReply(comment);
        }
        if (!isRepliesSectionOpen) {
            setRepliesSectionOpen(true);
        }
        setNumReplies(numReplies + 1);
        setReplyFormOpen(false);
    };

    const afterSubmitEdit = (comment: Comment) => {
        setIsEditing(false);
        if (comment.text !== comment.text) {
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
                setNextUrl(`${comment.replies.uri}?continuationToken=${json.continuationToken}`);
            }
            else {
                setNextUrl(undefined);
            }
        }
        else {
            console.error('Failed to load replies');
        }
    }

    if (isDeleted && numReplies === 0 && Object.keys(replies).length === 0) return null;

    const id = 'comment-' + comment.id;
    const bodyClassName = 'body' + (fragment?.endsWith(comment.id) ? ' is-selected' : '');
    const isOwner = user?.id === comment.author.id;

    return (
        <li id={id} className='comment' role='comment' data-author={comment.author.name}>
            <Portrait username={comment.author.id} url={comment.author.portraitUrl}/>
            <div className={bodyClassName}>
                <span className='author-name'>{comment.author.name}</span>
                <Timestamp isoTimestamp={comment.timestamp} />
                <If condition={isEdited}>
                    <span className='edit-indicator'>Edited</span>
                </If>
                <If condition={Boolean(comment.inReplyTo?.author)}>
                    <span className='reply-to'>Replying to <a href={'#' + comment.inReplyTo.id}>{comment.inReplyTo.author}</a></span>
                </If>
                <If condition={isEditing}>
                    <CommentForm
                        commentToEdit={{...comment, text: text}} // In case the user already edited this comment once
                        afterSubmit={afterSubmitEdit}
                        buttonLabel='Save edit'
                        type='edit'
                        onCancel={() => setIsEditing(false)}
                    />
                </If>
                <Else>
                    <Markdown text={isDeleted ? DELETED_MESSAGE : text} />
                </Else>
                <div className='post-actions'>
                    <If condition={!isDeleted}>
                        <Votes comment={comment} />
                    </If>
                    <button onClick={() => setReplyFormOpen(!isReplyFormOpen)} className={'reply-btn ' + (isReplyFormOpen ? 'open' : 'closed')}>Reply</button>
                    <ShareButton className='share-btn' fragment={id} />
                    <If condition={isOwner && !isDeleted}>
                        <button className='edit-btn' onClick={() => setIsEditing(!isEditing)}>Edit</button>
                        <button className='delete-btn' onClick={deleteComment}>Delete</button>
                    </If>
                </div>
            </div>
            <If condition={isReplyFormOpen}>
                <CommentForm
                    afterSubmit={afterSubmitNew}
                    threadId={parent?.comment?.id ?? comment.id}
                    inReplyTo={comment.id}
                    type='reply'
                    onCancel={() => setReplyFormOpen(false)}
                />
            </If>
            <If condition={isRepliesSectionOpen}>
                <button className='hide-replies' onClick={() => setRepliesSectionOpen(false)}>
                    <GoTriangleUp />Hide {repliesToStr(numReplies)}
                </button>
                <ul className='replies'>{
                    Object.values(replies)
                        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                        .map(reply =>
                            <FwComment
                                key={reply.id}
                                comment={reply}
                                parent={{
                                    comment,
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
                        <GoTriangleDown />
                        { isRepliesSectionOpen ? 'Show more replies': `View ${repliesToStr(numReplies)}` }
                    </>
                }
                loadingLabel={<><GoTriangleDown />Loading...</>}
                visible={numReplies > 0 && (!isRepliesSectionOpen || !!nextUrl)}
            />
        </li>
    )
}

function repliesToStr(numReplies: number) {
    return numReplies === 1 ? 'reply' : (numReplies + ' replies');
}
