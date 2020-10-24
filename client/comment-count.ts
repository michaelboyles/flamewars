const COMMENT_ANCHOR = '#comments';
const COUNT_URL = 'https://4y01mp2xdb.execute-api.eu-west-2.amazonaws.com/default/comment-count';
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

export function applyCountToCommentLinks() {
    const links = getFlamewarsLinks();
    const queryString = '?urls=' + links.map(link => normalizeUrl(link.href)).join(',');

    fetch(COUNT_URL + queryString)
        .then(resp => resp.json())
        .then(json => {
            for (const url in json) {
                const matchingLink = links.find(link => normalizeUrl(link.href) === url);
                if (matchingLink) matchingLink.text = json[url] + ' Comments';
            }
        }); 
}