import React from 'react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { AWS_GET_URL, USE_INFINITE_SCROLL } from '../config';
import { Comment, GetAllCommentsResponse } from '../../../common/types/get-all-comments-response';
import { CommentForm } from './CommentForm';
import { AuthContext, User } from '../context/AuthContext';
import { UrlFragmentContextProvider } from '../context/UrlFragmentContext';
import { FwHeader } from './FwHeader';
import { encodedWindowUrl } from '../util';
import { If } from 'jsx-conditionals';
import { LoadingSpinner } from './LoadingSpinner';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { LoadButton } from './LoadButton';

import type { Authorization } from '../../../common/types/add-comment-request';

import './FwComments.scss';

// Since comments are loaded dynamically after the page loads, normal URL fragments (e.g. #comment-123) won't work.
// We need to do the jump manually after the comments are loaded.
const jumpToComment = () => {
    if (window.location.hash?.startsWith('#comment-')) {
        const id = window.location.hash.substr(1);
        // Small timeout in case DOM hasn't been inserted yet
        setTimeout(() => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'}), 50);
    }
};

const FwComment = React.lazy(
    () => import('./FwComment').then(module => ({ default: module.FwComment }))
);

const FwComments = () => {
    const baseUrl = `${AWS_GET_URL}/comments/${encodedWindowUrl()}`;

    const [comments, setComments] = useState<Comment[]>([]);
    const [authorization, setAuthorization] = useState<Authorization>();
    const [user, setUser] = useState<User>();
    const [nextUrl, setNextUrl] = useState(baseUrl);

    const loadComments = async () => {
        if (!nextUrl) return Promise.resolve();
        try {
            const response = await fetch(nextUrl);
            const json = await response.json() as GetAllCommentsResponse;
            setComments(comments.concat(json.comments));
            if (json.continuationToken) {
                setNextUrl(`${baseUrl}?continuationToken=${json.continuationToken}`);
            }
            else {
                setNextUrl(undefined);
            }
            // TODO somewhat broken by pagination. If the comment is not on-screen, what should we do?
            jumpToComment();
        } catch (message) {
            return console.error(message);
        }
    };

    const triggerRef = useRef();
    const entry = useIntersectionObserver(triggerRef);
    const isTriggerVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isTriggerVisible && USE_INFINITE_SCROLL) loadComments();
    }, [isTriggerVisible]);

    useEffect(() => {
        if (!USE_INFINITE_SCROLL) loadComments();
    }, []);

    return (
        <section className='flamewars-container'>
            <UrlFragmentContextProvider>
                <AuthContext.Provider value={{authorization, setAuthorization, user, setUser}}>
                    <FwHeader />
                    <CommentForm afterSubmit={(comment: Comment) => setComments(comments.concat(comment))} type='add' />
                    <ul className='comments'>
                        { comments
                            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                            .map(comment => <Suspense key={comment.id} fallback={<></>}><FwComment comment={comment} /></Suspense>) }
                    </ul>
                    <div ref={triggerRef} className='infinite-scroll-trigger'>
                        <If condition={!!nextUrl && USE_INFINITE_SCROLL}>
                            <LoadingSpinner />
                        </If>
                        <LoadButton className='load-more-comments' load={loadComments} visible={!!nextUrl && !USE_INFINITE_SCROLL} />
                    </div>
                </AuthContext.Provider>
            </UrlFragmentContextProvider>
        </section>
    );
}

export default FwComments;
