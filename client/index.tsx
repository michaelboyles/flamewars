import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './style.scss';
import FwComments from './components/FwComments';
import applyCountToCommentLinks from './comment-count';

window.addEventListener('load', applyCountToCommentLinks);
ReactDOM.render(<FwComments />, document.getElementById('comments'));
