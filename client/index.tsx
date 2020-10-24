import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import { formatPastDate } from './time';
import type { Comment, GetAllCommentsResponse } from '../dist/get-all-comments-response'
import type { LocalAuthorization } from './components/SignIn'
import { SignIn } from './components/SignIn'
import { ReplyForm } from './components/ReplyForm';
import { AWS_GET_URL, DELETED_MESSAGE } from '../config';

const commentAnchor = '#comments';

function getFlamewarsLinks(): HTMLAnchorElement[] {
    const allLinks = document.getElementsByTagName('a');
    const flameWarsLinks: HTMLAnchorElement[] = [];
    for (let i = 0; i < allLinks.length; i++) {
        const item = allLinks.item(i);
        if (item.href.endsWith(commentAnchor)) {
            flameWarsLinks.push(item);
        }
    }
    return flameWarsLinks;
}

function removeFragment(url: string) {
    return url.substr(0, url.length - commentAnchor.length);   
}

function applyCountToCommentLinks() {
    const links = getFlamewarsLinks();
    const queryString = '?urls=' + links.map(link => removeFragment(link.href)).join(',');

    const COUNT_URL = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/comment-count';
    fetch(COUNT_URL + queryString)
        .then(resp => resp.json())
        .then(json => {
            for (const url in json) {
                const matchingLink = links.find(link => removeFragment(link.href) === url);
                if (matchingLink) matchingLink.text = json[url] + ' Comments';
            }
        }); 
}

function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return authorization && comment.author.id.endsWith(authorization.id);
}

const ShowComment = (props: {comment: Comment, authorization: LocalAuthorization}) => {
    const [replies, setReplies] = useState(props.comment.replies);
    const [isReplyOpen, setReplyOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(false);

    const deleteComment = () => {
        fetch(AWS_GET_URL + `?url=${encodeURIComponent(window.location.toString())}&commentId=${encodeURIComponent(props.comment.id)}`, { method: 'DELETE' })
            .then(response => { if (response.ok) setDeleted(true); })
            .catch(e => console.log(e));
    }

    if (isDeleted && !replies.length) return null;

    const text = isDeleted ? DELETED_MESSAGE : props.comment.text;
    return (
        <li className='comment'>
            <img className='portrait' src={props.comment.author.portraitUrl ? props.comment.author.portraitUrl : 'https://via.placeholder.com/100x100' } />
            <div className='body'>
                <span className='author-name'>{props.comment.author.name}</span>
                <span className='timestamp'>{formatPastDate(Date.parse(props.comment.timestamp))}</span>
                { isOwner(props.authorization, props.comment) ?<a onClick={() => deleteComment()}>Delete</a> : null }
                <span className='content'>{text}</span>
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

window.addEventListener('load', applyCountToCommentLinks);
ReactDOM.render(<Comments />, document.getElementById('comments'));
