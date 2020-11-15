import * as React from 'react';
import { useEffect, useState } from 'react';
import { AWS_GET_URL } from '../../config';
import { Comment, GetAllCommentsResponse } from '../../common/types/get-all-comments-response';
import FwComment from './FwComment';
import ReplyForm from './ReplyForm';
import { LocalAuthorization, SignIn } from './SignIn';

const FwComments = () => {
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
                { comments
                    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                    .map(comment => <FwComment key={comment.id} comment={comment} authorization={authorization} />) }
            </ul>
        </>
    );
}

export default FwComments;
