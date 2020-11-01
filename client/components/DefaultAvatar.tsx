import * as React from 'react';

const DefaultAvatar = (props: {colour: string}) => {
    return (
        <svg className='portrait' xmlns="http://www.w3.org/2000/svg" width="50" height="50">
            <g>
                <title>Background</title>
                <rect fill="#eee" id="canvas_background" height="50" width="50" y="0" x="0"/>
            </g>
            <g>
                <title>Person</title>
                <ellipse ry="8.98734" rx="8.98734" id="svg_3" cy="21.19066" cx="25" strokeOpacity="null" strokeWidth="0" stroke="#000" fill={props.colour}/>
                <ellipse ry="20.12658" rx="15.06329" id="svg_4" cy="50.05142" cx="25" strokeOpacity="null" strokeWidth="0" stroke="#000" fill={props.colour}/>
            </g>
        </svg>
    )
}

export default DefaultAvatar;
