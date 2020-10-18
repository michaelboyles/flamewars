import React = require('react');
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner'
import type { Comment, CommentId } from '../../dist/comment'
import type { Authorization, PostCommentRequest } from '../../dist/post-comment-request'

type CommentConsumer = (comment: Comment) => void;

const submitUrl = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/post-comment-request-js';

function submitComment(text: string, authorization: Authorization, onDone: CommentConsumer, inReplyTo?: CommentId) {
    const request: PostCommentRequest = {
        url: window.location.toString(),
        comment: text,
        inReplyTo: inReplyTo,
        authorization: authorization
    };
    fetch(submitUrl, {
            body: JSON.stringify(request),
            method: 'POST'
        })
        .then(r => r.json())
        .then(json => onDone(json.comment))
        .catch(e => console.error(e))
}

export const ReplyForm = (props: {inReplyTo?: CommentId, authorization: Authorization, onDone: CommentConsumer}) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        submitComment(
            text,
            props.authorization,
            comment => { props.onDone(comment); setIsSubmitting(false); },
            props.inReplyTo
        );
    };
    return (
        <form onSubmit={onSubmit}>
            {isSubmitting ? <LoadingSpinner /> : null}
            <textarea onChange={e => setText(e.target.value)} readOnly={isSubmitting} ></textarea>
            <button type="submit" disabled={isSubmitting}>Post</button>
        </form>
    );
}
