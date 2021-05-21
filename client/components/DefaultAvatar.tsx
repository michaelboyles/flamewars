import * as React from 'react';
import identicon = require('svg-identicon');
import md5 = require('md5');

export const DefaultAvatar = (props: {username: string, bgcolour: string}) => {
    const avatar = identicon({
        hash: md5(props.username),
        type: 'SQUARE',
        width: 50,
        size: 5,
        background: {
            color: props.bgcolour
        }
    });
    return <div className='portrait' dangerouslySetInnerHTML={{__html: avatar}}/>
}
