import { AUTHED_USER_STORAGE_KEY, FRIENDLIST_STORAGE_KEY } from '../constants'
import { updateAuthenticationMenu } from './contextMenus'
import TwitterAPI from './requestor'
import Storage from './storage'
import GetFriendsList from './friends'

function fetchFriends (id) {
    return GetFriendsList(id)
    .then((list=[]) => {
        if (list.length) {
            return Storage.set(FRIENDLIST_STORAGE_KEY, list)
        }
    })
}

// Handle authenticated user
function initializeUser (user) {
    const auth = user && user.auth,
        authed = typeof auth !== 'undefined'
    TwitterAPI.setAuth(auth)
    updateAuthenticationMenu(authed)
    if (authed) {
        fetchFriends(user.id)
    } else {
        Storage.set(FRIENDLIST_STORAGE_KEY, [])
    }
}

function storageListener (changes, namespace) {
    const userChange = changes[AUTHED_USER_STORAGE_KEY]
    if (userChange) {
        // Update authenticated user if changed
        // in chrome storage
        initializeUser(userChange.newValue)
    }
}

export function get () {
    return Storage.get(AUTHED_USER_STORAGE_KEY)
}

export function set (user) {
    if (user)
        return Storage.set(AUTHED_USER_STORAGE_KEY, user)
    else
        return Storage.remove(AUTHED_USER_STORAGE_KEY)
}

export function init () {
    get().then(initializeUser)
    chrome.storage.onChanged.addListener(storageListener)
}