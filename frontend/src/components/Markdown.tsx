import ReactMarkdown from 'react-markdown';
import { ALLOW_IMAGES } from '../config';

export type Props = {
    text: string
}
export function Markdown({ text }: Props) {
    const disallowedElements = ALLOW_IMAGES ? [] : ['image'];
    return (
        <div className="content">
            <ReactMarkdown disallowedElements={disallowedElements}>{ addAutoLinks(text) }</ReactMarkdown>
        </div>
    )
}

function addAutoLinks(comment: string) : string {
    return comment.replace(/((?<!]\()https?:\/\/[^\s)]+)/gi, '[$1]($1)');
}
