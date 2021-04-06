import React = require('react');

import './LoadingSpinner.scss';

const LoadingSpinner = () => {
    return (
        <div className='loading-spinner'>
            <div></div><div></div><div></div><div></div>
        </div>
    );
}

export default LoadingSpinner;
