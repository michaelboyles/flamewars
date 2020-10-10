import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import { formatPastDate } from './time';
import type { PostCommentRequest } from '../dist/post-comment-request'

const submitUrl = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/post-comment-request-js';

interface Author {
    name: string;
    portraitUrl?: string;
}

interface Comment {
    id: CommentId;
    text: string;
    author: Author;
    timestamp: Date;
    replies: Comment[];
}

type CommentId = string;

function submitComment(text: string, event: React.FormEvent<HTMLFormElement>, inReplyTo?: CommentId) {
    event.preventDefault();
    const request: PostCommentRequest = {
        url: window.location.toString(),
        comment: text,
        inReplyTo: '123', //TODO server complains if absent
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

function ShowComment(comment: Comment) {
    const [isReplyOpen, setReplyOpen] = useState(false);

    return (
        <li className='comment'>
            <img className='portrait' src={comment.author.portraitUrl ? comment.author.portraitUrl : 'https://via.placeholder.com/100x100' } />
            <div className='body'>
                <span className='author-name'>{comment.author.name}</span>
                <span className='timestamp'>{formatPastDate(comment.timestamp)}</span>
                <span className='content'>{comment.text}</span>
                <a onClick={() => setReplyOpen(!isReplyOpen)} className={isReplyOpen ? 'open' : 'closed'}>Reply</a>
                {
                    isReplyOpen ? <AddComment inReplyTo={ comment.id } /> : null
                }
                {
                    comment.replies.length ?
                        <ul>{ comment.replies.map(reply => ShowComment(reply)) }</ul>
                        :
                        null
                }
            </div>
        </li>
    );
}

// Some mock data
const comments: Comment[] = [
    {
        id: '123',
        text: 'This is a comment',
        author: {
            name: 'Cpt Obvious'
        },
        timestamp: new Date(),
        replies: [
            {
                id: '456',
                text: 'I agree with you. That is a comment',
                author: {
                    name: 'Michael'
                },
                timestamp: new Date(),
                replies: []
            }
        ]
    }
]

function Comments() {
    return (
        <>
            <AddComment />
            <ul className='comments'>
                { comments.map(comment => ShowComment(comment)) }
            </ul>
        </>
    );
}

ReactDOM.render(<Comments />, document.getElementById('comments'));
