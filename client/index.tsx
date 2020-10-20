import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import { formatPastDate } from './time';
import type { Authorization } from '../dist/post-comment-request'
import type { Comment, GetAllCommentsResponse } from '../dist/get-all-comments-response'
import type { LocalAuthorization } from './components/SignIn'
import { SignIn } from './components/SignIn'
import { ReplyForm } from './components/ReplyForm';
import { AWS_GET_URL } from '../config';

function deleteComment(authorization: LocalAuthorization, comment: Comment) {
    console.log("MBMB", comment);
    fetch(AWS_GET_URL + `?url=${encodeURIComponent(window.location.toString())}&commentId=${encodeURIComponent(comment.id)}`, { method: 'DELETE' })
        .then(response => response.ok ? alert('Deleted') : alert('Failed'))
        .catch(e => console.log(e));
}

function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return authorization && comment.author.id.endsWith(authorization.id);
}

const ShowComment = (props: {comment: Comment, authorization: LocalAuthorization}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);

    return (
        <li className='comment'>
            <img className='portrait' src={props.comment.author.portraitUrl ? props.comment.author.portraitUrl : 'https://via.placeholder.com/100x100' } />
            <div className='body'>
                <span className='author-name'>{props.comment.author.name}</span>
                <span className='timestamp'>{formatPastDate(Date.parse(props.comment.timestamp))}</span>
                { isOwner(props.authorization, props.comment) ? <a onClick={() => deleteComment(props.authorization, props.comment)}>Delete</a> : null  }
                <span className='content'>{props.comment.text}</span>
                <a onClick={() => setReplyOpen(!isReplyOpen)} className={isReplyOpen ? 'open' : 'closed'}>Reply</a>
                {
                    isReplyOpen ? <ReplyForm authorization={props.authorization}
                                             afterSubmit={comment => { setReplies(replies.concat(comment)); setReplyOpen(false); }}
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

const Comments = () => {
    const [comments, setComments] = useState([] as Comment[]);
    const [authorization, setAuthorization] = useState(null as LocalAuthorization);

    useEffect(() => {
        fetch(AWS_GET_URL + '?url=' + window.location.toString())
            .then(response => response.json())
            .then(json => setComments((json as GetAllCommentsResponse).comments))
            .catch(e => console.log(e));
      }, []
    );

    return (
        <>
            <SignIn authorization={authorization} setAuthorization={setAuthorization} />
            <ReplyForm afterSubmit={(comment: Comment) => setComments(comments.concat(comment))} authorization={authorization} />
            <ul className='comments'>
                { comments.map(comment => <ShowComment comment={comment} authorization={authorization} />) }
            </ul>
        </>
    );
}

ReactDOM.render(<Comments />, document.getElementById('comments'));
