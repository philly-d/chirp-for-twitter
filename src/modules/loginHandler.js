import TwitterAPI from './requestor'
import * as AuthedUser from './authedUser'
const AUTH_RESPONSE_HEADER = 'X-Authentication-Response'.toLowerCase()
const loginUrl = 'https://chrometweets.herokuapp.com/auth/twitter'
const loginCb = 'https://chrometweets.herokuapp.com/auth/twitter/callback*'
const loginInitUrl = 'https://chrometweets.herokuapp.com/login'

export function storeAuthenticatedUser (user) {
    return AuthedUser.set(user)
}

// Open a login popup.
// If 'direct', go straight to Twitter's login page.
export function initiateLogin (direct) {
    const url = direct ? loginUrl : loginInitUrl
    chrome.windows.create({
        url: url,
        width: 500,
        height: 515,
        type: 'popup',
        focused: true
    }, function(win){
        // TODO:
        // Associate initializing tab + response callback with
        // this login attempt via the created window popup
    })
}

// Toggle login (via context menu click)
export function loginOrLogout () {
    return AuthedUser.get()
    .then((authedUser) => {
        if (authedUser)
            storeAuthenticatedUser()
        else
            initiateLogin(true)
    })
}

// Catch login success url response.
// Retrieve the authenticated user data
// from the headers and store it.
chrome.webRequest.onResponseStarted.addListener(function(details){
    let { responseHeaders, tabId } = details,
        authenticatedUser = null,
        authenticationError = null

    let authResponse = responseHeaders.find(function(header) {
        return header.name.toLowerCase() === AUTH_RESPONSE_HEADER
    })
    if (authResponse) {
        try {
            let value = decodeURIComponent(escape(window.atob(authResponse.value))),
                json = JSON.parse(value)
            storeAuthenticatedUser(json)
        } catch (err) {
            // TODO: Handle login failure
            console.log('Failed to parse/store user on login', err, authResponse)
        }
    }

    // Login success, we can close the popup
    chrome.tabs.remove(tabId)
},
{
    urls: [loginCb],
    types: ['main_frame']
},
['responseHeaders'])
