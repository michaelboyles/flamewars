import React = require('react');
import { useContext, useState } from 'react';
import LoadingSpinner from './LoadingSpinner'
import type { Comment, CommentId } from '../../common/types/comment'
import type { AddCommentRequest } from '../../common/types/add-comment-request'
import type { EditCommentRequest } from '../../common/types/edit-comment-request'
import { AWS_GET_URL, MAX_COMMENT_LENGTH } from '../../config';
import { normalizeUrl } from '../../common/util';
import ReactMde from 'react-mde';
import Markdown from './Markdown';
import { AuthContext } from '../context/AuthContext';

import 'react-mde/lib/styles/css/react-mde-all.css';

// ReactMde has the concept of collecting actions into group but we can't use them because flexbox for responsive layout
// needs 1 DOM element containing all actions. Visual groupings are achieved by CSS instead.
// Omitted actions: checked-list, header, save-image, strikethrough
const TOOLBAR_COMMANDS = [['bold', 'italic', 'link', 'quote', 'code', 'image', 'unordered-list', 'ordered-list']];

type CommentConsumer = (comment: Comment) => void;

interface Props {
    afterSubmit: CommentConsumer,
    buttonLabel?: string,
    type: 'ADD' | 'EDIT' | 'REPLY',
    inReplyTo?: CommentId,  // Required if type == REPLY
    commentToEdit?: Comment // Required if type == EDIT
}

function sendRequest(url: string, method: 'POST' | 'PATCH', request: any, afterSubmit: CommentConsumer, onError: () => void) {
    fetch(url, { body: JSON.stringify(request), method: method})
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

const CommentForm = (props: Props) => { 
    const [text, setText] = useState(props?.commentToEdit?.text ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const { authorization } = useContext(AuthContext);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!authorization) {
            setError('Please sign in first');
            return;
        }
        if (!text || text.trim().length === 0) {
            setError('Comment cannot be blank');
            return;
        }

        setIsSubmitting(true);
        if (props.type === 'EDIT') {
            if (text === props.commentToEdit.text) {
                setIsSubmitting(false);
                setError(null);
                props.afterSubmit(props.commentToEdit);
                return;
            }

            const request: EditCommentRequest = {
                comment: text,
                authorization
            };
            sendRequest(
                `${AWS_GET_URL}/${encodeURIComponent(normalizeUrl(window.location.toString()))}/${props.commentToEdit.id}`,
                'PATCH',
                request,
                _comment => {
                    setText('');
                    setIsSubmitting(false); 
                    setError(null);
                    props.afterSubmit({...props.commentToEdit, text: text})
                },
                () => { setError('There was a problem submitting your edit'); setIsSubmitting(false); }
            )
        }
        else {
            const request: AddCommentRequest = {
                comment: text,
                inReplyTo: props.inReplyTo,
                authorization
            };
            sendRequest(
                `${AWS_GET_URL}/${encodeURIComponent(normalizeUrl(window.location.toString()))}/new`,
                'POST',
                request,
                comment => { setText(''); setIsSubmitting(false); setError(null); props.afterSubmit(comment); },
                () => { setError('There was a problem submitting your comment'); setIsSubmitting(false); }
            );
        }
    };
    return (
        <form className='reply-form' onSubmit={onSubmit}>
            {isSubmitting ? <LoadingSpinner /> : null}
            <ReactMde
                value={text}
                onChange={setText}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={markdown => Promise.resolve(<Markdown text={markdown}/>) }
                toolbarCommands={TOOLBAR_COMMANDS} 
            />
            <button type="submit" disabled={isSubmitting || text.length > MAX_COMMENT_LENGTH}>{props.buttonLabel || 'Post'}</button>
            <CommentLengthMessage length={text.length} />
            { error ? <p>{error}</p> : null }
        </form>
    );
}

export default CommentForm;
