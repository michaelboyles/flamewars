import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import { formatPastDate } from './time';
import type { PostCommentRequest } from '../dist/post-comment-request'
import type { CommentId } from '../dist/comment'
import type { Comment, GetAllCommentsResponse } from '../dist/get-all-comments-response'

const submitUrl = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/post-comment-request-js';
const getUrl = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/comments';

function submitComment(text: string, event: React.FormEvent<HTMLFormElement>, inReplyTo?: CommentId) {
    event.preventDefault();
    const request: PostCommentRequest = {
        url: window.location.toString(),
        comment: text,
        inReplyTo: inReplyTo,
        authorization: {
            token: 'abc',
            tokenProvider: 'Google'
        }
    };
    fetch(submitUrl, {
            body: JSON.stringify(request),
            method: 'POST'
        })
        .then(r => r.json())
        .then(json => console.log("Comment posted successfully", json))
        .catch(e => console.error(e))
}

function AddComment(props: { inReplyTo?: CommentId }) {
    const [text, setText] = useState('');
    return (
        <form onSubmit={e => submitComment(text, e, props.inReplyTo)}>
            <textarea onChange={e => setText(e.target.value)}></textarea>
            <button type="submit">Post</button>
        </form>
    );
}

const ShowComment = (props: {comment: Comment}) => {
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
                    isReplyOpen ? <AddComment inReplyTo={ props.comment.id } /> : null
                }
                {
                    props.comment.replies.length ?
                        <ul>{ props.comment.replies.map(reply => <ShowComment comment={reply} />) }</ul>
                        :
                        null
                }
            </div>
        </li>
    );
}

const Comments = () => {
    const [comments, setComments] = useState([] as Comment[]);

    useEffect(() => {
        fetch(getUrl + '?url=' + window.location.toString())
            .then(response => response.json())
            .then(json => setComments((json as GetAllCommentsResponse).comments))
            .catch(e => console.log(e));
      }, []
    );

    return (
        <>
            <AddComment />
            <ul className='comments'>
                { comments.map(comment => <ShowComment comment={comment} />) }
            </ul>
        </>
    );
}

ReactDOM.render(<Comments />, document.getElementById('comments'));
