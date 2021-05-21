import React = require('react');

import './LoadingSpinner.scss';

export const LoadingSpinner = () => {
    return (
        <div className='loading-spinner'>
            <div></div><div></div><div></div><div></div>
        </div>
    );
}
