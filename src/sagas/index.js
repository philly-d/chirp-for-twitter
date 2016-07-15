import ChromePromise from 'chrome-promise'
chrome.promise = new ChromePromise()
import { delay, takeEvery, takeLatest, eventChannel, END } from 'redux-saga'
import { race, take, put, call, fork, select, cancelled } from 'redux-saga/effects'
import {
    receiveThread, startTweet, receiveScreenshot, sendTweet, addTweet, setActiveTweet,
    takeScreenshot, enableScreenshotter, showBanner, hideBanner, initScreenshotUpload, updateScreenshot,
    TAKE_SCREENSHOT, SEND_TWEET, INITIATE_LOGIN, SHOW_SCREENSHOTTER, REMOVE_SCREENSHOT,
    START_TWEET, RECEIVE_SCREENSHOT, RECEIVE_TWEET_THREAD, HIDE_BANNER, SHOW_BANNER, RECEIVE_AUTHENTICATED_USER,
} from '../actions'
import {
    RECEIVE_THREAD_KEY, ACTIVE_VIEW_NONE, ACTIVE_VIEW_THREAD, DEFAULT_EDITOR_ID, DISPATCH_ACTION
} from '../constants'

import { listenForStorageChanges, loadFromStorage } from './storage'
import EmitAction from '../modules/actionEmitter'
import { listenForMessages } from './chrome'
import { watchSendTweetRequests } from './tweets'
import { watchTakeScreenshotRequests, watchNewScreenshots } from './screenshots'
import checkBlacklist from './blacklist'
import $ from 'jquery'
import ensureEditorInitialization from './editor'

// When the document state is ready, check to see if a
// twitter thread has been injected to be loaded
function onDocumentReady () {
    return new Promise((resolve, reject) => {
        $(document).ready(() => resolve() )
    })
}
function* receiveInjectedData() {
    yield call(onDocumentReady)
    let thread = window[RECEIVE_THREAD_KEY]
    if (thread) {
        yield put(receiveThread(thread))
    }
}

// Listen for certain events which should 'activate' the app.
// On activation, do startup work (load authenticated user,
// subscribe to chrome storage changes)
function* listenForStartup() {
    // Listen once for any of these events
    let appShouldActivate = yield take([START_TWEET, SHOW_SCREENSHOTTER, RECEIVE_SCREENSHOT, RECEIVE_TWEET_THREAD])

    // Start listening for any changes to chrome.storage
    yield fork(listenForStorageChanges)
    yield fork(loadFromStorage)

    // If the user has started the app, we should enable the
    // screenshot button even if it is normally disabled.
    const { canShowScreenshotButton } = yield select((state) => state.app )
    if (!canShowScreenshotButton)
        yield put(enableScreenshotter())
}

// Relay login attempts to the background script
function* loginRequest(action) {
    try {
        yield call(EmitAction, action)
    } catch (error) {
        console.log('Failed to initiate login', error)
    }
}
function* watchLoginRequests() {
    yield* takeEvery(INITIATE_LOGIN, loginRequest)
}

export default function* root() {
    yield [
        fork(listenForStartup),
        fork(watchNewScreenshots),
        fork(watchLoginRequests),
        fork(watchTakeScreenshotRequests),
        fork(watchSendTweetRequests),
        fork(listenForMessages),
        fork(checkBlacklist),
        fork(ensureEditorInitialization),
        fork(receiveInjectedData)
    ]
}



