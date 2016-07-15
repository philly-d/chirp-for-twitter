export const ACTIVATE_EDITOR_STATE = 'ACTIVATE_EDITOR_STATE'
export const SET_EDITOR_STATE = 'SET_EDITOR_STATE'

export const RECEIVE_SCREENSHOT = 'RECEIVE_SCREENSHOT'
export const REMOVE_SCREENSHOT = 'REMOVE_SCREENSHOT'
export const UPDATE_SCREENSHOT = 'UPDATE_SCREENSHOT'

export const RECEIVE_TWEET_THREAD = 'RECEIVE_TWEET_THREAD'
export const SET_ACTIVE_TWEET = 'SET_ACTIVE_TWEET'

export const SET_AUTOCOMPLETE_TERM = 'SET_AUTOCOMPLETE_TERM'
export const SET_AUTOCOMPLETE_LIST = 'SET_AUTOCOMPLETE_LIST'
export const UPDATE_AUTOCOMPLETE_INDEX = 'UPDATE_AUTOCOMPLETE_INDEX'
export const SELECT_AUTOCOMPLETE_ITEM = 'SELECT_AUTOCOMPLETE_ITEM'

export const RECEIVE_AUTHENTICATED_USER = 'RECEIVE_AUTHENTICATED_USER'
export const RECEIVE_FRIENDS = 'RECEIVE_FRIENDS'

export const ADD_TWEET = 'ADD_TWEET'

export const SHOW_BANNER = 'SHOW_BANNER'
export const HIDE_BANNER = 'HIDE_BANNER'

export const START_TWEET = 'START_TWEET'
export const CLOSE_APP = 'CLOSE_APP'
export const TOGGLE_APP_EXPANSION = 'TOGGLE_APP_EXPANSION'
export const RECEIVE_ACTIVE_VIEW = 'RECEIVE_ACTIVE_VIEW'

export const SHOW_SCREENSHOTTER = 'SHOW_SCREENSHOTTER'
export const HIDE_SCREENSHOTTER = 'HIDE_SCREENSHOTTER'
export const DISABLE_SCREENSHOTTER = 'DISABLE_SCREENSHOTTER'
export const ENABLE_SCREENSHOTTER = 'ENABLE_SCREENSHOTTER'

export const INITIATE_LOGIN = 'INITIATE_LOGIN'

export const SEND_TWEET = 'SEND_TWEET'
export const SEND_TWEET_REQUEST = 'SEND_TWEET_REQUEST'
export const SEND_TWEET_SUCCESS = 'SEND_TWEET_SUCCESS'
export const SEND_TWEET_FAILURE = 'SEND_TWEET_FAILURE'

export const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT'
export const SCREENSHOT_REQUEST = 'SCREENSHOT_REQUEST'
export const SCREENSHOT_SUCCESS = 'SCREENSHOT_SUCCESS'
export const SCREENSHOT_FAILURE = 'SCREENSHOT_FAILURE'

export const UPLOAD_SCREENSHOT = 'UPLOAD_SCREENSHOT'
export const UPLOAD_SCREENSHOT_REQUEST = 'UPLOAD_SCREENSHOT_REQUEST'
export const UPLOAD_SCREENSHOT_SUCCESS = 'UPLOAD_SCREENSHOT_SUCCESS'
export const UPLOAD_SCREENSHOT_FAILURE = 'UPLOAD_SCREENSHOT_FAILURE'


export function activateEditorState({ tweet, forceFocus }) {
    return {
        type: ACTIVATE_EDITOR_STATE,
        tweet, forceFocus
    }
}
function action(type, payload={}) {
    return {
        ...payload,
        type
    }
}

export function initiateLogin(indirect) {
    return {
        type: INITIATE_LOGIN,
        direct: !indirect
    }
}

export function initSendTweet(data) {
    return action(SEND_TWEET, data)
}
export const sendTweet = {
    request: (request) => action(SEND_TWEET_REQUEST, { request }),
    success: (request, response) => action(SEND_TWEET_SUCCESS, { request, response }),
    failure: (request, error) => action(SEND_TWEET_FAILURE, { request, error })
}
export function initTakeScreenshot (data) {
    return action(TAKE_SCREENSHOT, data)
}
export const takeScreenshot = {
    request: (request) => action(SCREENSHOT_REQUEST, { request }),
    success: (request, response) => action(SCREENSHOT_SUCCESS, { request, response }),
    failure: (request, error) => action(SCREENSHOT_FAILURE, { request, error })
}
export function initScreenshotUpload (data) {
    return action(UPLOAD_SCREENSHOT, data)
}
export const uploadScreenshot = {
    request: (request) => action(UPLOAD_SCREENSHOT_REQUEST, { request }),
    success: (request, response) => action(UPLOAD_SCREENSHOT_SUCCESS, { request, response }),
    failure: (request, error) => action(UPLOAD_SCREENSHOT_FAILURE, { request, error })
}

export function startTweet() {
    return {
        type: START_TWEET
    }
}

export function disableScreenshotter() {
    return {
        type: DISABLE_SCREENSHOTTER
    }
}
export function enableScreenshotter() {
    return { type: ENABLE_SCREENSHOTTER }
}
export function showScreenshotter() {
    return {
        type: SHOW_SCREENSHOTTER
    }
}
export function hideScreenshotter() {
    return {
        type: HIDE_SCREENSHOTTER
    }
}

export function showBanner({ error, tweet, message }) {
    let banner = {
        type: error ? 'error' : (tweet ? 'tweet' : 'success'),
        tweet, error, message
    }
    if (!message && error) {
        banner.message = error.message
    }
    return {
        type: SHOW_BANNER,
        banner
    }
}
export function hideBanner(){
    return {
        type: HIDE_BANNER
    }
}


export function closeApp() {
    return {
        type: CLOSE_APP
    }
}

export function toggleAppExpansion() {
    return {
        type: TOGGLE_APP_EXPANSION
    }
}

export function receiveAuthenticatedUser(user) {
    return {
        type: RECEIVE_AUTHENTICATED_USER,
        user
    }
}

export function receiveFriendsList(friends) {
    return {
        type: RECEIVE_FRIENDS,
        list: friends
    }
}

export function setActiveTweet({ threadId, tweet, forceFocus }) {
    return {
        type: SET_ACTIVE_TWEET,
        threadId,
        tweet,
        forceFocus
    }
}

export function selectAutocompleteItem(data) {
    return {
        type: SELECT_AUTOCOMPLETE_ITEM,
        ...data
    }
}

export function updateAutocompleteIndex({ offset, index }) {
    return {
        type: UPDATE_AUTOCOMPLETE_INDEX,
        offset, index
    }
}


export function receiveThread(data) {
    return {
        type: RECEIVE_TWEET_THREAD,
        ...data
    }
}


export function receiveScreenshot(screenshot) {
    return {
        type: RECEIVE_SCREENSHOT,
        screenshotId: screenshot.id,
        screenshot
    }
}
export function updateScreenshot(screenshot) {
    return {
        type: UPDATE_SCREENSHOT,
        screenshotId: screenshot.id,
        screenshot
    }
}

export function removeScreenshot(screenshotId) {
    return {
        type: REMOVE_SCREENSHOT,
        screenshotId
    }
}


export function addTweet({tweet, replyToId, threadId}) {
    return {
        type: ADD_TWEET,
        tweet, replyToId, threadId
    }
}


export function setEditorState(editorState, replyToId) {
    return {
        type: SET_EDITOR_STATE,
        editorState, replyToId
    }
}

export const setAutocompleteTerm = function ({term, indices}) {
    return {
        type: SET_AUTOCOMPLETE_TERM,
        term, indices
    }
}

export const setAutocompleteList = function (list) {
    return {
        type: SET_AUTOCOMPLETE_LIST,
        list
    }
}
