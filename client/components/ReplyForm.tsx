import React = require('react');
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner'
import type { Comment, CommentId } from '../../common/types/comment'
import type { Authorization, AddCommentRequest } from '../../common/types/add-comment-request'
import type { EditCommentRequest } from '../../common/types/edit-comment-request'
import { AWS_GET_URL, MAX_COMMENT_LENGTH } from '../../config';
import { normalizeUrl } from '../../common/util';

type CommentConsumer = (comment: Comment) => void;

function editComment(commentId: CommentId, text: string, authorization: Authorization, afterSubmit: CommentConsumer, onError: () => void) {
    const request: EditCommentRequest = {
        comment: text,
        authorization: authorization
    };
    fetch(`${AWS_GET_URL}/${encodeURIComponent(normalizeUrl(window.location.toString()))}/${commentId}`, {
            body: JSON.stringify(request),
            method: 'PATCH'
        })
        .then(r => {
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(json => afterSubmit(json.comment))
        .catch(() => onError())
}

function submitComment(text: string, authorization: Authorization, afterSubmit: CommentConsumer, onError: () => void, inReplyTo?: CommentId) {
    const request: AddCommentRequest = {
        comment: text,
        inReplyTo: inReplyTo,
        authorization: authorization
    };
    fetch(`${AWS_GET_URL}/${encodeURIComponent(normalizeUrl(window.location.toString()))}/new`, {
            body: JSON.stringify(request),
            method: 'POST'
        })
        .then(r => {
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(json => afterSubmit(json.comment))
        .catch(() => onError())
}

const CommentLengthMessage = (props: {length: number}) => {
    const charsRemaining = MAX_COMMENT_LENGTH - props.length;
    if (charsRemaining === MAX_COMMENT_LENGTH) return null;
    const noun = Math.abs(charsRemaining) === 1 ? 'character' : 'characters';
    return (
        <span className='chars-remaining-msg'>
            { charsRemaining < 0 ? `Too long by ${Math.abs(charsRemaining)} ${noun}` : `${charsRemaining} ${noun} remaining`}
        </span>
    )
}

const ReplyForm = (props: {authorization: Authorization, afterSubmit: CommentConsumer,
                            inReplyTo?: CommentId, initialText?: string, buttonLabel?: string, isEdit: boolean }) => {
    const [text, setText] = useState(props.initialText || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!props.authorization) {
            setError('Please sign in first');
            return;
        }

        setIsSubmitting(true);
        if (props.isEdit) {
            editComment(
                props.inReplyTo, //TODO a hack
                text,
                props.authorization,
                _comment => { setText(''); setIsSubmitting(false); setError(null); props.afterSubmit({text: text} as Comment)},
                () => {}
            )
        }
        else {
            submitComment(
                text,
                props.authorization,
                comment => { setText(''); setIsSubmitting(false); setError(null); props.afterSubmit(comment); },
                () => { setError('There was a problem submitting your comment'); setIsSubmitting(false); },
                props.inReplyTo
            );
        }
    };
    return (
        <form className='reply-form' onSubmit={onSubmit}>
            {isSubmitting ? <LoadingSpinner /> : null}
            <textarea value={text} onChange={e => setText(e.target.value)} readOnly={isSubmitting} ></textarea>
            <button type="submit" disabled={isSubmitting || text.length > MAX_COMMENT_LENGTH}>{props.buttonLabel || 'Post'}</button>
            <CommentLengthMessage length={text.length} />
            { error ? <p>{error}</p> : null }
        </form>
    );
}

export default ReplyForm;
