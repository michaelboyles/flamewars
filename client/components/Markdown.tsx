import React = require('react');
import ReactMarkdown = require('react-markdown');
import { NodeType } from 'react-markdown';
import { ALLOW_IMAGES } from '../../config';

function addAutoLinks(comment: string) : string {
    return comment.replace(/((?<!]\()https?:\/\/[^\s)]+)/gi, '[$1]($1)');
}

const Markdown = (props: {text: string}) => {
    const disallowedTypes: NodeType[] = ALLOW_IMAGES ? [] : ['image'];
    return (
        <ReactMarkdown className='content' disallowedTypes={disallowedTypes}>{addAutoLinks(props.text)}</ReactMarkdown>
    )
}

export default Markdown;
