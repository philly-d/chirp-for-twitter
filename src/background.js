import "babel-polyfill"
import './modules/chromePromise'
import './modules/messageListener'
import { createMenus, updateAuthenticationMenu } from './modules/contextMenus'
import listenForUpdates from './modules/updater'
import injectContentScripts from './modules/injector'
import { initiateLogin } from './modules/loginHandler'
import { AUTHED_USER_STORAGE_KEY } from './constants'
import * as AuthedUser from './modules/authedUser'

// Handle extension installation / update
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        // Show login on initial install
        initiateLogin()
    }
    // Inject content script in any tabs opened before the
    // extension was installed (so it can be used immediately).
    // This also handles extension updates, where we want to
    // override the now-disconnected content-scripts in any
    // open tabs.
    injectContentScripts()
})

// Handle changes to storage to sync
// friendlist + auth for API access
AuthedUser.init()

// Create context menu items
createMenus()

// Listen for extension updates and auto-reload when available
listenForUpdates()
