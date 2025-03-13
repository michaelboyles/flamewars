import React from 'react';
import FwComments from './components/FwComments';
import { createRoot } from 'react-dom/client';
import { applyCountToCommentLinks } from './comment-count';
import { HTML_CONTAINER_ID } from './config';

import './style.scss';

window.addEventListener('load', applyCountToCommentLinks);

const container = document.getElementById(HTML_CONTAINER_ID);
if (container) {
    const root = createRoot(container);
    root.render(<FwComments />)
}
