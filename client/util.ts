import { LocalAuthorization } from './components/SignIn';

import type { Comment } from '../common/types/get-all-comments-response';

export function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return (!!authorization) && comment.author.id.endsWith(authorization.id);
};
