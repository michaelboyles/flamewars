import * as React from 'react';
import { useEffect, useState } from 'react';
import { AWS_GET_URL } from '../../config';
import { Comment, GetAllCommentsResponse } from '../../common/types/get-all-comments-response';
import FwComment from './FwComment';
import CommentForm from './CommentForm';
import { LocalAuthorization, SignIn } from './SignIn';
import { AuthContext } from '../context/AuthContext';

const FwComments = () => {
    const [comments, setComments] = useState([] as Comment[]);
    const [authorization, setAuthorization] = useState(null as LocalAuthorization);

    useEffect(() => {
        fetch(`${AWS_GET_URL}/${encodeURIComponent(window.location.toString())}`)
            .then(response => response.json())
            .then(json => setComments((json as GetAllCommentsResponse).comments))
            .catch(e => console.log(e));
      }, []
    );

    return (
        <AuthContext.Provider value={{authorization, setAuthorization}}>
            <SignIn />
            <CommentForm afterSubmit={(comment: Comment) => setComments(comments.concat(comment))} type='ADD' />
            <ul className='comments'>
                { comments
                    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                    .map(comment => <FwComment key={comment.id} comment={comment} />) }
            </ul>
        </AuthContext.Provider>
    );
}

export default FwComments;
