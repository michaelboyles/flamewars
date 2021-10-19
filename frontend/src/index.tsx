import React from 'react';
import ReactDOM from 'react-dom';
import FwComments from './components/FwComments';
import { applyCountToCommentLinks } from './comment-count';
import { HTML_CONTAINER_ID } from './config';

import './style.scss';

window.addEventListener('load', applyCountToCommentLinks);

const container = document.getElementById(HTML_CONTAINER_ID);
if (container) {
    ReactDOM.render(<FwComments />, container);
}
