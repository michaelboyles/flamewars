import identicon from 'svg-identicon';
import md5 from 'md5';

type Props = {
    username: string
    bgcolour: string
}
export function DefaultAvatar({ username, bgcolour }: Props) {
    const avatar = identicon({
        hash: md5(username),
        type: 'SQUARE',
        width: 50,
        size: 5,
        background: {
            color: bgcolour
        }
    });
    return (
        <div className='portrait' dangerouslySetInnerHTML={{__html: avatar}} />
    )
}
