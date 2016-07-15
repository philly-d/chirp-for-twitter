import { loginOrLogout } from './loginHandler'
import { startTweet, showScreenshotter, disableScreenshotter } from '../actions'
import { SHOT_BLACKLIST_STORAGE_KEY } from '../constants'
import {
    START_SCREENSHOT, START_TWEET, DISABLE_SCREENSHOT, AUTHENTICATION
} from '../constants/contextMenuTypes'
import EmitAction from './actionEmitter'
import blacklistButtonOnDomain from './blacklist'

const menuItems = [
    {
        id: START_SCREENSHOT,
        title: 'Screenshot this for a tweet',
        contexts: ['all']
    },
    {
        id: START_TWEET,
        title: 'Start a tweet on this page',
        contexts: ['all']
    },
    {
        id: 'settingsSeparator',
        type: 'separator'
    },
    // {
    //     id: 'showTweetsOnOpen',
    //     type: 'checkbox',
    //     checked: true,
    //     title: 'Show tweets when you open a link from Twitter.com'
    // },
    {
        id: DISABLE_SCREENSHOT,
        title: 'Hide screenshot button on this domain'
    },
    {
        id: AUTHENTICATION,
        title: 'Login with Twitter'
    }
]

// Handle a context menu click and dispatch any
// corresponding actions to the active tab
function onClickHandler(info, tab) {
    
    let action
    switch (info.menuItemId) {
        case AUTHENTICATION:
            loginOrLogout()
            break
        case START_TWEET:
            action = startTweet()
            break
        case START_SCREENSHOT:
            action = showScreenshotter()
            break
        case DISABLE_SCREENSHOT:
            blacklistButtonOnDomain(tab.url)
            action = disableScreenshotter()
            break
        default:
            return
    }
    if (action) // Send an action to the active tab
        EmitAction(action, tab.id)
}

chrome.contextMenus.onClicked.addListener(onClickHandler)
chrome.browserAction.onClicked.addListener((tab) => {
    // Start a tweet on active tab when the browser action
    // icon is clicked.
    EmitAction(startTweet(), tab.id)
})

function createMenuItem (item) {
    chrome.contextMenus.create(item)
}
export function createMenus () {
    menuItems.forEach(createMenuItem)
}

export function updateMenu (id, data) {
    chrome.contextMenus.update(id, data)
}

export function updateAuthenticationMenu (authed) {
    const title = authed ? 'Logout' : 'Login with Twitter'
    chrome.contextMenus.update(AUTHENTICATION, { title })
}
