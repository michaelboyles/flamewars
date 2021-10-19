import { GetCommentCountResponse } from  '../../common/types/comment-count'
import { normalizeUrl } from '../../common/util'
import { MAX_URLS_IN_COUNT_REQUEST } from '../../common/constants';
import { AWS_GET_URL, HTML_CONTAINER_ID } from './config';

export function applyCountToCommentLinks() {
    const links = getFlamewarsLinks();

    const chunkSize = MAX_URLS_IN_COUNT_REQUEST;
    for (var i = 0; i < links.length; i += chunkSize) {
        const chunk = links.slice(i, i + chunkSize);
        const queryString = '?urls=' + chunk.map(link => normalizeUrl(link.href)).join(',');
        fetch(`${AWS_GET_URL}/comment-count${queryString}`)
            .then(resp => resp.json())
            .then((json: GetCommentCountResponse) => 
                json.counts.forEach(urlAndCount => {
                    if (urlAndCount.count) {
                        const matchingLink = links.find(link => normalizeUrl(link.href) === urlAndCount.url);
                        if (matchingLink) {
                            if (urlAndCount.count == 1) {
                                matchingLink.text = '1 Comment';
                            }
                            else {
                                matchingLink.text = urlAndCount.count + ' Comments';
                            }
                        }
                    }
                })
            );
    }
}

function getFlamewarsLinks(): HTMLAnchorElement[] {
    const allLinks = document.getElementsByTagName('a');
    const flameWarsLinks: HTMLAnchorElement[] = [];
    for (let i = 0; i < allLinks.length; i++) {
        const item = allLinks.item(i);
        if (item.href.endsWith(HTML_CONTAINER_ID)) {
            flameWarsLinks.push(item);
        }
    }
    return flameWarsLinks;
}
