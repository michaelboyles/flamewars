import React = require('react');
import ReactMarkdown = require('react-markdown');
import { ALLOW_IMAGES } from '../config';

function addAutoLinks(comment: string) : string {
    return comment.replace(/((?<!]\()https?:\/\/[^\s)]+)/gi, '[$1]($1)');
}

export const Markdown = (props: {text: string}) => {
    const disallowedElements = ALLOW_IMAGES ? [] : ['image'];
    return (
        <ReactMarkdown className='content' disallowedElements={disallowedElements}>{addAutoLinks(props.text)}</ReactMarkdown>
    )
}
