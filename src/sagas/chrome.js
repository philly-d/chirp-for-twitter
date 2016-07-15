import {
    DISPATCH_ACTION,
    RUNTIME_REQUEST_SUCCESS, RUNTIME_REQUEST_FAILURE, RUNTIME_REQUEST_RECEIVED
} from '../constants'
import { eventChannel, END } from 'redux-saga'
import { take, put, call, cancelled } from 'redux-saga/effects'

function messageListener (emitter) {
    return function(message, sender, sendResponse) {
        emitter({
            message, sender, sendResponse
        })

        sendResponse(RUNTIME_REQUEST_RECEIVED)
    }
}
function messageChannel () {
    return eventChannel(emitter => {
        const listener = messageListener(emitter)

        chrome.runtime.onMessage.addListener(listener)

        return () => chrome.runtime.onMessage.removeListener(listener)
    })
}

// Open a channel to listen for messages sent across
// the chrome extension (from the background page)
export function* listenForMessages() {
    const chan = yield call(messageChannel)
    try {
        while (true) {
            let { message } = yield take(chan)
            const { type, data } = message

            if (message.type === DISPATCH_ACTION) {
                // Dispatch an action sent from the background page
                try {
                    yield put(data)
                } catch (err) {
                    console.log('Failed to dispatch action', message, err)
                }
            }
        }
    } finally {
        if (yield cancelled()) {
            chan.close()
            console.log('Message listener cancelled')
        }
    }
}