import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import { formatPastDate } from './time';
import type { PostCommentRequest, Authorization } from '../dist/post-comment-request'
import type { CommentId } from '../dist/comment'
import type { Comment, GetAllCommentsResponse } from '../dist/get-all-comments-response'
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';

interface LocalAuthorization extends Authorization
{
    name: string;
}

type CommentConsumer = (comment: Comment) => void;

const submitUrl = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/post-comment-request-js';
const getUrl = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/comments';

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

function LoadingSpinner() {
    return (
        <div className='loading-spinner'>
            <div></div><div></div><div></div><div></div>
        </div>
    );
}

function AddComment(props: {inReplyTo?: CommentId, authorization: Authorization, onDone: CommentConsumer}) {
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

const ShowComment = (props: {comment: Comment, authorization: Authorization}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);

    return (
        <li className='comment'>
            <img className='portrait' src={props.comment.author.portraitUrl ? props.comment.author.portraitUrl : 'https://via.placeholder.com/100x100' } />
            <div className='body'>
                <span className='author-name'>{props.comment.author.name}</span>
                <span className='timestamp'>{formatPastDate(Date.parse(props.comment.timestamp))}</span>
                <span className='content'>{props.comment.text}</span>
                <a onClick={() => setReplyOpen(!isReplyOpen)} className={isReplyOpen ? 'open' : 'closed'}>Reply</a>
                {
                    isReplyOpen ? <AddComment authorization={props.authorization}
                                              onDone={comment => { setReplies(replies.concat(comment)); setReplyOpen(false); }}
                                              inReplyTo={props.comment.id} />
                                : null
                }
                {
                    replies.length ?
                        <ul>{ replies.map(reply => <ShowComment comment={reply} authorization={props.authorization} />) }</ul>
                        :
                        null
                }
            </div>
        </li>
    );
}

const SignIn = (props: {authorization: LocalAuthorization, setAuthorization}) => {
    return props.authorization ? 
        <span>Signed in as {props.authorization.name}</span>
        :
        <GoogleLogin 
            clientId='164705233134-movagpgcoeepgc24qksgil15k2qpde8e.apps.googleusercontent.com'
            onSuccess={resp => props.setAuthorization({
                token: (resp as GoogleLoginResponse).tokenId,   //TODO how to remove 'as'?
                tokenProvider: 'Google',
                name: (resp as GoogleLoginResponse).getBasicProfile().getName()
            })} 
            isSignedIn={true}
        />
}

const Comments = () => {
    const [comments, setComments] = useState([] as Comment[]);
    const [authorization, setAuthorization] = useState(null as LocalAuthorization);

    useEffect(() => {
        fetch(getUrl + '?url=' + window.location.toString())
            .then(response => response.json())
            .then(json => setComments((json as GetAllCommentsResponse).comments))
            .catch(e => console.log(e));
      }, []
    );

    return (
        <>
            <SignIn authorization={authorization} setAuthorization={setAuthorization} />
            <AddComment onDone={(a: Comment) => setComments(comments.concat(a))} authorization={authorization} />
            <ul className='comments'>
                { comments.map(comment => <ShowComment comment={comment} authorization={authorization} />) }
            </ul>
        </>
    );
}

ReactDOM.render(<Comments />, document.getElementById('comments'));
