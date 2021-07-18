import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import { AWS_GET_URL } from '../config';
import { Comment, GetAllCommentsResponse } from '../../common/types/get-all-comments-response';
import { CommentForm } from './CommentForm';
import { LocalAuthorization } from './SignIn';
import { AuthContext } from '../context/AuthContext';
import { UrlFragmentContextProvider } from '../context/UrlFragmentContext';
import { FwHeader } from './FwHeader';
import { encodedWindowUrl } from '../util';
import { If } from './If';

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
    const [comments, setComments] = useState([] as Comment[]);
    const [authorization, setAuthorization] = useState(null as LocalAuthorization);
    const [continuationToken, setContinuationToken] = useState<string>(undefined);

    const loadComments = () => {
        const queryStr = continuationToken ? `?continuationToken=${continuationToken}` : '';
        fetch(`${AWS_GET_URL}/comments/${encodedWindowUrl()}${queryStr}`)
            .then(response => response.json())
            .then(json => {
                const response = json as GetAllCommentsResponse;
                setComments(comments.concat(response.comments));
                setContinuationToken(response.continuationToken);
                // TODO somewhat broken by pagination. If the comment is not on-screen, what should we do?
                jumpToComment();
            })
            .catch(console.error);
    }

    useEffect(() => loadComments(), []);

    return (
        <section className='flamewars-container'>
            <UrlFragmentContextProvider>
                <AuthContext.Provider value={{authorization, setAuthorization}}>
                    <FwHeader />
                    <CommentForm afterSubmit={(comment: Comment) => setComments(comments.concat(comment))} type='add' />
                    <ul className='comments'>
                        { comments
                            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                            .map(comment => <Suspense key={comment.id} fallback={<></>}><FwComment comment={comment} /></Suspense>) }
                    </ul>
                    <If condition={!!continuationToken}>
                        <button onClick={loadComments}>Load more</button>
                    </If>
                </AuthContext.Provider>
            </UrlFragmentContextProvider>
        </section>
    );
}

export default FwComments;
