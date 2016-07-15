import { eventChannel, END } from 'redux-saga'
import { take, put, call, cancelled } from 'redux-saga/effects'
import {
    AUTHED_USER_STORAGE_KEY, FRIENDLIST_STORAGE_KEY
} from '../constants'
import { receiveAuthenticatedUser, receiveFriendsList } from '../actions'


const storageKeys = [AUTHED_USER_STORAGE_KEY, FRIENDLIST_STORAGE_KEY]
const storageKeyToActionMap = {
    [AUTHED_USER_STORAGE_KEY]: receiveAuthenticatedUser,
    [FRIENDLIST_STORAGE_KEY]: receiveFriendsList 
}
function* populateStateFromStore(key, value) {
    let action = storageKeyToActionMap[key]
    if (action) {
        yield put(action(value))
    }
}
function storageListener (emitter) {
    return function(changes, namespace) {
        emitter({
            changes, namespace
        })
    }
}
// Open a channel to listen for changes to shared chrome storage
// (authenticated user + friend list)
function storageChannel () {
    return eventChannel(emitter => {
        const listener = storageListener(emitter)

        chrome.storage.onChanged.addListener(listener)

        return () => chrome.storage.onChanged.removeListener(listener)
    })
}

// Handle storage changes via saga channel
export function* listenForStorageChanges() {
    const chan = yield call(storageChannel)
    try {
        while (true) {
            let { changes, namespace } = yield take(chan)
            // Dispatch actions based on storage item changes
            for (var key in changes) {
                yield populateStateFromStore(key, changes[key].newValue)
            }
        }
    } finally {
        if (yield cancelled()) {
            chan.close()
        }
    }
}

export function getStorage (keys=storageKeys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (stored) => {
            if (chrome.runtime.lastError)
                reject(chrome.runtime.lastError)
            else
                resolve(stored)
        })
    })
}

// Populate store from items in chrome.storage
export function* loadFromStorage() {
    try {
        const stored = yield call(getStorage)
        for (var key in stored) {
           yield populateStateFromStore(key, stored[key])
        }
    } catch (err) {
        console.log('Failed to load storage', err)
    }

}