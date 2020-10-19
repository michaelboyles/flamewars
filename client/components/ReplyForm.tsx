import React = require('react');
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner'
import type { Comment, CommentId } from '../../dist/comment'
import type { Authorization, PostCommentRequest } from '../../dist/post-comment-request'
import { AWS_SUBMIT_URL, MAX_COMMENT_LENGTH } from '../../config';

type CommentConsumer = (comment: Comment) => void;

function submitComment(text: string, authorization: Authorization, afterSubmit: CommentConsumer, inReplyTo?: CommentId) {
    const request: PostCommentRequest = {
        url: window.location.toString(),
        comment: text,
        inReplyTo: inReplyTo,
        authorization: authorization
    };
    fetch(AWS_SUBMIT_URL, {
            body: JSON.stringify(request),
            method: 'POST'
        })
        .then(r => r.json())
        .then(json => afterSubmit(json.comment))
        .catch(e => console.error(e))
}

const CommentLengthMessage = (props: {length: number}) => {
    const charsRemaining = MAX_COMMENT_LENGTH - props.length;
    const noun = Math.abs(charsRemaining) === 1 ? 'character' : 'characters';
    return (
        <span>
            { charsRemaining < 0 ? `Too long by ${Math.abs(charsRemaining)} ${noun}` : `${charsRemaining} ${noun} remaining`}
        </span>
    )
}

export const ReplyForm = (props: {authorization: Authorization, afterSubmit: CommentConsumer, inReplyTo?: CommentId}) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        submitComment(
            text,
            props.authorization,
            comment => { props.afterSubmit(comment); setIsSubmitting(false); },
            props.inReplyTo
        );
    };
    return (
        <form onSubmit={onSubmit}>
            {isSubmitting ? <LoadingSpinner /> : null}
            <textarea onChange={e => setText(e.target.value)} readOnly={isSubmitting} ></textarea>
            <CommentLengthMessage length={text.length} />
            <button type="submit" disabled={isSubmitting || text.length > MAX_COMMENT_LENGTH}>Post</button>
        </form>
    );
}
