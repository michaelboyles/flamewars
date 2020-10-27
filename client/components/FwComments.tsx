import * as React from 'react';
import { useEffect, useState } from 'react';
import { AWS_GET_URL } from '../../config';
import { Comment, GetAllCommentsResponse } from '../../dist/get-all-comments-response';
import { FwComment } from './FwComment';
import { ReplyForm } from './ReplyForm';
import { LocalAuthorization, SignIn } from './SignIn';

export const FwComments = () => {
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
                { comments.map(comment => <FwComment key={comment.id} comment={comment} authorization={authorization} />) }
            </ul>
        </>
    );
}