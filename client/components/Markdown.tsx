import React = require('react');
import ReactMarkdown = require('react-markdown');

function addAutoLinks(comment: string) : string {
    return comment.replace(/((?<!]\()https?:\/\/[^\s)]+)/gi, '[$1]($1)');
}

const Markdown = (props: {text: string}) => {
    return (
        <ReactMarkdown className='content'>{addAutoLinks(props.text)}</ReactMarkdown>
    )
}

export default Markdown;
