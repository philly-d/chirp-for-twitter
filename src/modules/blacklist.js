import { SHOT_BLACKLIST_STORAGE_KEY } from '../constants'
import Storage from './storage'

function getDomain (url) {
    let link = document.createElement('a')
    link.href = url
    return link.host.split('.').slice(-2).join('.')
}

// Add a domain to the blacklist (it won't be able
// to show the screenshot button)
export default function blacklistButtonOnDomain (url) {
    const domain = getDomain(url)
    return Storage.get(SHOT_BLACKLIST_STORAGE_KEY)
    .then((blacklist=[]) => {
        if (!blacklist.includes(domain)) {
            blacklist.push(domain)
            return Storage.set(SHOT_BLACKLIST_STORAGE_KEY, blacklist)
        } else {
            return blacklist
        }
    })
}
