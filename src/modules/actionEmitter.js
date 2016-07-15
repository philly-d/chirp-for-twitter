import {
    DISPATCH_ACTION, RUNTIME_REQUEST_SUCCESS, RUNTIME_REQUEST_FAILURE
} from '../constants'

function ChromeError (chromeError) {
    // This page was likely disconnected from
    // the rest of the extension.
    let error = new Error()
    error.message = 'Send failed. Please try again or reload.'
    error.chromeError = chromeError
    return error
}

function sendMessage (message, tabId) {
    return new Promise((resolve, reject) => {
        // Handle the response. Reject the promise if
        // the task fails or the extension is unable
        // to communicate.
        const callback = (response) => {
            if (chrome.runtime.lastError) {
                reject(ChromeError(chrome.runtime.lastError))
                return
            }
            const { result, data, error } = response
            if (result === RUNTIME_REQUEST_SUCCESS)
                resolve(data)
            else if (result === RUNTIME_REQUEST_FAILURE)
                reject(error)
            else
                resolve(response)
        }

        try {
            if (typeof tabId !== 'undefined') // Dispatch action to a tab
                chrome.tabs.sendMessage(tabId, message, callback)
            else // Dispatch action to the background page
                chrome.runtime.sendMessage(message, callback)
        } catch (err) {
            reject(ChromeError(err))
        }
    })
}

// Dispatch an action to either the background page
// or the active tab.
export default function emitAction (action, tabId) {
    return sendMessage({
        type: DISPATCH_ACTION,
        data: action
    }, tabId)
}