import { delay, takeEvery } from 'redux-saga'
import { race, take, put, call, fork, select } from 'redux-saga/effects'
import {
    startTweet, receiveScreenshot, takeScreenshot, enableScreenshotter,
    initScreenshotUpload, updateScreenshot,
    TAKE_SCREENSHOT, SEND_TWEET, INITIATE_LOGIN, SHOW_SCREENSHOTTER, REMOVE_SCREENSHOT,
    RECEIVE_SCREENSHOT, RECEIVE_AUTHENTICATED_USER,
} from '../actions'
import { ACTIVE_VIEW_NONE } from '../constants'
import EmitAction from '../modules/actionEmitter'

// Ask background-page to take screenshot and pass it
// to app if successful
function* takeScreenshotRequest(action) {
    yield put(takeScreenshot.request(action))
    try {
        const screenshot = yield call(EmitAction, action)
        if (screenshot)
            yield put(receiveScreenshot(screenshot))

        yield put(takeScreenshot.success(action, screenshot))
    } catch (error) {
        yield put(takeScreenshot.failure(action, error))
        console.log('Failed to get screenshot', error)
    }
}

// Upload screenshot to Twitter
function* uploadScreenshot (screenshot) {
    try {
        const uploaded = yield call(EmitAction, initScreenshotUpload({ screenshot }))
        if (uploaded) {
            yield put(updateScreenshot({
                ...uploaded,
                id: screenshot.id
            }))
        }
    } catch (err) {
        console.log('Failed to upload screenshot', err, screenshot)
    }
}

// Wait a few seconds (for user to start tweeting or cancel/remove screenshot)
// before uploading it to Twitter ahead of time so that the tweet can be sent
// faster. If the user isn't authenticated, we also wait for them to login.
function* delayScreenshotUpload(screenshot, authenticated) {
    let actions = {
        interrupted: take([RECEIVE_SCREENSHOT, REMOVE_SCREENSHOT, SEND_TWEET]),
        authenticated: take(RECEIVE_AUTHENTICATED_USER)
    }
    if (authenticated)
        actions.timeout = call(delay, 5000)
    const { interrupted } = yield race(actions)
    if (!interrupted) {
        authenticated = yield select((state) => state.user.authenticated)
        if (authenticated) {
            yield call(uploadScreenshot, screenshot)
        }
    }
}

// Ensure a tweet is started when a screenshot is received
function* handleNewScreenshot({ screenshot }) {
    const state = yield select()
    const hasNoActiveView = state.app.activeView === ACTIVE_VIEW_NONE,
        authenticated = state.user.authenticated
    yield fork(delayScreenshotUpload, screenshot, authenticated) // Start upload, if possible
    if (hasNoActiveView) yield put(startTweet())
}


export function* watchTakeScreenshotRequests() {
    yield* takeEvery(TAKE_SCREENSHOT, takeScreenshotRequest)
}

export function* watchNewScreenshots(){
    yield* takeEvery(RECEIVE_SCREENSHOT, handleNewScreenshot)
}
