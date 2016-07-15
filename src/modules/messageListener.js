import PrepareTweetInjector from './tweetInjector'
import Scraper from './scraper'
import Screenshotter from './screenshotter'
import { initiateLogin } from './loginHandler'
import TwitterAPI from './requestor'
import { sendTweet, uploadMedia } from './tweeter'
import {
    TAKE_SCREENSHOT, UPLOAD_SCREENSHOT, SEND_TWEET, INITIATE_LOGIN
} from '../actions'
import {
    DISPATCH_ACTION, RUNTIME_REQUEST_SUCCESS, RUNTIME_REQUEST_FAILURE
} from '../constants'


function HandleAction (action) {
    switch (action.type) {
        case TAKE_SCREENSHOT:
            return Screenshotter(action)
        case UPLOAD_SCREENSHOT:
            const { screenshot } = action
            return TwitterAPI.uploadImage(screenshot.dataUrl)
        case SEND_TWEET:
            return sendTweet(action)
        case INITIATE_LOGIN:
            return initiateLogin(true)
        default:
            return
    }
}


function handleMessage(message, sender, sendResponse) {
    const { type, data } = message
    switch (type) {
        case DISPATCH_ACTION:
            return HandleAction(data)
        case 'tweetLinkClicked':
            PrepareTweetInjector(data)
            return
        default:
            return
    }
}

function isPromise (obj) {
    if (obj) {
        return obj instanceof Promise || typeof obj.then === 'function'
    } else {
        return false
    }
}
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    const result = handleMessage(message, sender)
    if (isPromise(result)) {
        // Asynchronous task
        result.then(
        (data) => {
            sendResponse({
                result: RUNTIME_REQUEST_SUCCESS,
                data: data
            })
        },
        (error) => {
            sendResponse({
                result: RUNTIME_REQUEST_FAILURE,
                error
            })
        })
        return true // Keep channel open for async response
    } else {
        sendResponse({
            result: RUNTIME_REQUEST_SUCCESS,
            data: result
        })
        return true
    }
})

