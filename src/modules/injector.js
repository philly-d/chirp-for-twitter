function isTwitterUrl (url) {
    let link = document.createElement('a')
    link.href = url
    return link.host === 'twitter.com'
}

function injectTab (tab) {
    if (isTwitterUrl(tab.url)) {
        chrome.tabs.executeScript(tab.id, { file: 'twitter.js'})
    }
    chrome.tabs.executeScript(tab.id, { file: 'content.js'})
}

// Inject content scripts in all open tabs
// TODO: Use extension manifest with each script and its
// url matchers to do this properly.
export default function injectContentScripts () {
    chrome.windows.getAll({populate: true}, (windows) => {
        windows.forEach((win) => {
            win.tabs.forEach(injectTab)
        })
    })
}