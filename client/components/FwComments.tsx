import * as React from 'react';
import { useEffect, useState } from 'react';
import { AWS_GET_URL } from '../config';
import { Comment, GetAllCommentsResponse } from '../../common/types/get-all-comments-response';
import FwComment from './FwComment';
import CommentForm from './CommentForm';
import { LocalAuthorization } from './SignIn';
import { AuthContext } from '../context/AuthContext';
import FwHeader from './FwHeader';
import { normalizeUrl } from '../../common/util';

import './FwComments.scss';

const FwComments = () => {
    const [comments, setComments] = useState([] as Comment[]);
    const [authorization, setAuthorization] = useState(null as LocalAuthorization);

    useEffect(() => {
        fetch(`${AWS_GET_URL}/comments/${encodeURIComponent(normalizeUrl(window.location.toString()))}`)
            .then(response => response.json())
            .then(json => setComments((json as GetAllCommentsResponse).comments))
            .catch(e => console.log(e));
      }, []
    );

    return (
        <section className='flamewars-container'>
            <AuthContext.Provider value={{authorization, setAuthorization}}>
                <FwHeader />
                <CommentForm afterSubmit={(comment: Comment) => setComments(comments.concat(comment))} type='add' />
                <ul className='comments'>
                    { comments
                        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                        .map(comment => <FwComment key={comment.id} comment={comment} />) }
                </ul>
            </AuthContext.Provider>
        </section>
    );
}

export default FwComments;
