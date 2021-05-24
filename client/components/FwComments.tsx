import * as React from 'react';
import { useEffect, useState } from 'react';
import { AWS_GET_URL } from '../config';
import { Comment, GetAllCommentsResponse } from '../../common/types/get-all-comments-response';
import { FwComment } from './FwComment';
import { CommentForm } from './CommentForm';
import { LocalAuthorization } from './SignIn';
import { AuthContext } from '../context/AuthContext';
import { UrlFragmentContextProvider } from '../context/UrlFragmentContext';
import { FwHeader } from './FwHeader';
import { encodedWindowUrl } from '../util';

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

const FwComments = () => {
    const [comments, setComments] = useState([] as Comment[]);
    const [authorization, setAuthorization] = useState(null as LocalAuthorization);

    useEffect(() => {
        fetch(`${AWS_GET_URL}/comments/${encodedWindowUrl()}`)
            .then(response => response.json())
            .then(json => {
                setComments((json as GetAllCommentsResponse).comments);
                jumpToComment();
            })
            .catch(console.error);
    }, []);

    return (
        <section className='flamewars-container'>
            <UrlFragmentContextProvider>
                <AuthContext.Provider value={{authorization, setAuthorization}}>
                    <FwHeader />
                    <CommentForm afterSubmit={(comment: Comment) => setComments(comments.concat(comment))} type='add' />
                    <ul className='comments'>
                        { comments
                            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                            .map(comment => <FwComment key={comment.id} comment={comment} />) }
                    </ul>
                </AuthContext.Provider>
            </UrlFragmentContextProvider>
        </section>
    );
}

export default FwComments;
