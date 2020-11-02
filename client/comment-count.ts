const COMMENT_ANCHOR = '#comments';
const COUNT_URL = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/comment-count';
import { GetCommentCountResponse } from  '../dist/comment-count'
import { normalizeUrl } from '../common/util'

function getFlamewarsLinks(): HTMLAnchorElement[] {
    const allLinks = document.getElementsByTagName('a');
    const flameWarsLinks: HTMLAnchorElement[] = [];
    for (let i = 0; i < allLinks.length; i++) {
        const item = allLinks.item(i);
        if (item.href.endsWith(COMMENT_ANCHOR)) {
            flameWarsLinks.push(item);
        }
    }
    return flameWarsLinks;
}

function applyCountToCommentLinks() {
    const links = getFlamewarsLinks();
    const queryString = '?urls=' + links.map(link => normalizeUrl(link.href)).join(',');

    fetch(COUNT_URL + queryString)
        .then(resp => resp.json())
        .then((json: GetCommentCountResponse) => 
            json.counts.forEach(urlAndCount => {
                const matchingLink = links.find(link => normalizeUrl(link.href) === urlAndCount.url);
                if (matchingLink) matchingLink.text = urlAndCount.count + ' Comments';
            })
        );
}

export default applyCountToCommentLinks;
