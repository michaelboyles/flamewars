import React = require('react');
import { useContext, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner'
import type { Comment, CommentId } from '../../common/types/comment'
import type { AddCommentRequest } from '../../common/types/add-comment-request'
import type { EditCommentRequest } from '../../common/types/edit-comment-request'
import { ALLOW_IMAGES, AWS_GET_URL, MAX_COMMENT_LENGTH } from '../../config';
import { normalizeUrl } from '../../common/util';
import ReactMde from 'react-mde';
import Markdown from './Markdown';
import { AuthContext } from '../context/AuthContext';
import { SignIn } from './SignIn';

import './CommentForm.scss'
// There is an -all but we don't want the preview styles
import 'react-mde/lib/styles/css/react-mde.css';
import 'react-mde/lib/styles/css/react-mde-editor.css';
import 'react-mde/lib/styles/css/react-mde-suggestions.css';
import 'react-mde/lib/styles/css/react-mde-toolbar.css';
import { useElementSize } from '../hooks/useElementSize';

// ReactMde has the concept of collecting actions into group but we can't use them because flexbox for responsive layout
// needs 1 DOM element containing all actions. Visual groupings are achieved by CSS instead.
// Omitted actions: checked-list, header, save-image, strikethrough
const TOOLBAR_COMMANDS = [[
    ...(['bold', 'italic', 'link', 'quote', 'code']),
    ...(ALLOW_IMAGES ? ['image'] : []), 
    ...['unordered-list', 'ordered-list']
]];

type CommentConsumer = (comment: Comment) => void;
type CommentType = 'add' | 'edit' | 'reply';

interface Props {
    afterSubmit: CommentConsumer,
    buttonLabel?: string,
    type: CommentType,
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

function getPlaceholder(type: CommentType) {
    switch (type) {
        case 'add':
            return 'Leave a comment\u2026';
        case 'edit':
            // Bit of an edge case where the user is editing their comment and removed all the text
            return 'Your edit cannot be blank'
        case 'reply':
            return 'Leave a reply\u2026'
    }
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

const SubmitButton = (props: {label?: string, isSubmitting: boolean, disabled: boolean}) => {
    let label = props.label || 'Post';
    if (props.isSubmitting) {
        label = 'Submitting\u2026';
    }
    return (
        <button type="submit" disabled={props.disabled}>
            {label}{props.isSubmitting ? <LoadingSpinner /> : null}
        </button>
    )
}

const CommentForm = (props: Props) => { 
    const [text, setText] = useState(props?.commentToEdit?.text ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const [hasBeenFocused, setHasBeenFocused] = useState(false);
    const { authorization } = useContext(AuthContext);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!text || text.trim().length === 0) {
            setError('Comment cannot be blank');
            return;
        }

        setIsSubmitting(true);
        if (props.type === 'edit') {
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
                `${AWS_GET_URL}/comments/${encodeURIComponent(normalizeUrl(window.location.toString()))}/${props.commentToEdit.id}`,
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
                `${AWS_GET_URL}/comments/${encodeURIComponent(normalizeUrl(window.location.toString()))}/new`,
                'POST',
                request,
                comment => { setText(''); setIsSubmitting(false); setError(null); props.afterSubmit(comment); },
                () => { setError('There was a problem submitting your comment'); setIsSubmitting(false); }
            );
        }
    };

    const formRef = useRef<HTMLFormElement>();
    const size = useElementSize(formRef.current);
    const isLarge = size.width > 500;

    return (
        <form className={`reply-form ${props.type} ${isLarge ? 'large' : ''}`} onSubmit={onSubmit} ref={formRef}>
            <ReactMde
                value={text}
                onChange={setText}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={markdown => Promise.resolve(<Markdown text={markdown}/>) }
                toolbarCommands={TOOLBAR_COMMANDS} 
                childProps={{
                    textArea: {
                        // User clicked a button to do this, so focus it for them
                        autoFocus: (props.type === 'edit' || props.type === 'reply'),
                        className: 'mde-text' + (hasBeenFocused ? ' focused-once' : ''),
                        onFocus: () => setHasBeenFocused(true),
                        placeholder: getPlaceholder(props.type),
                        style: { height: undefined }
                    }
                }}
            />
            {
                authorization ?
                    (
                        <SubmitButton
                            disabled={isSubmitting || text.length > MAX_COMMENT_LENGTH}
                            label={props.buttonLabel}
                            isSubmitting={isSubmitting}
                        />
                    )
                    : <SignIn />
            }
            <CommentLengthMessage length={text.length} />
            { error ? <p>{error}</p> : null }
        </form>
    );
}

export default CommentForm;
