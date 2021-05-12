import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import FwComments from './components/FwComments';
import applyCountToCommentLinks from './comment-count';
import { HTML_CONTAINER_ID } from './config';

window.addEventListener('load', applyCountToCommentLinks);

const container = document.getElementById(HTML_CONTAINER_ID);
if (container) {
    ReactDOM.render(<FwComments />, container);
}
