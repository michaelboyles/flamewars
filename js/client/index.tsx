import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';

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

function formatTimestamp(timestamp: Date) {
    const now = new Date();
    const age = Math.abs(now.getTime() - timestamp.getTime());

    const millisPerSecond = 1000;
    const millisPerMinute = millisPerSecond * 60;
    const millisPerHour   = millisPerMinute * 60;
    const millisPerDay    = millisPerHour * 24;
    const millisPerMonth  = millisPerDay * 30;
    const millisPerYear   = millisPerDay * 365;

    let unit: string;
    let quantity: number;
    if (age < millisPerMinute) {
        unit = 'second';
        quantity = Math.floor(age / millisPerSecond);
    }
    else if (age < millisPerHour) {
        unit = 'minute';
        quantity = Math.floor(age / millisPerMinute);
    }
    else if (age < millisPerDay) {
        unit = 'hour';
        quantity = Math.floor(age / millisPerHour);
    }
    else if (age < millisPerMonth) {
        unit = 'day';
        quantity = Math.floor(age / millisPerDay);
    }
    else if (age < millisPerYear) {
        unit = 'month';
        quantity = Math.floor(age / millisPerMonth);
    }
    else {
        unit = 'year';
        quantity = Math.floor(age / millisPerYear);
    }
    return `${quantity} ${unit}${quantity == 1 ? '' : 's'} ago`; 
}

function submitComment(event: React.FormEvent<HTMLFormElement>, inReplyTo?: CommentId) {
    if (inReplyTo) {
        alert(`You replied to ${inReplyTo}!`);
    }
    else {
        alert(`You commented on ${window.location}`)
    }
    event.preventDefault();
}

function AddComment(props: { inReplyTo?: CommentId }) {
    return (
        <form onSubmit={e => submitComment(e, props.inReplyTo)}>
            <textarea></textarea>
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
                <span className='timestamp'>{formatTimestamp(comment.timestamp)}</span>
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
