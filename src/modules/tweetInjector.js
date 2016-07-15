import { RECEIVE_THREAD_KEY } from '../constants'
import EmitAction from './actionEmitter'
import { receiveThread } from '../actions'
import TweetScraper from './scraper'

var TweetsToInject = {}
// Ensure tweets are received by the content script:
// 1. Dispatch an action if the content script is already running and
// listening for messages.
// 2. Set tweet thread as a global variable which will be read by the script
// when it initializes.
function injectTweetsInTab (tabId, threadData) {
    EmitAction(receiveThread(threadData), tabId)
    const script = `
        window['${RECEIVE_THREAD_KEY}'] = ${JSON.stringify(threadData)};
    `
    chrome.tabs.executeScript(tabId, {
        code: script,
        runAt: 'document_start'
    })
}
// If there is a tweet id associated with this t.co request,
// fetch the tweet thread and inject it.
function injectTweetsForRequest(tcoRequest, completedRequest) {
    let data = TweetsToInject[tcoRequest.url]
    if (!data) return
    let tweetUrl = `https://twitter.com/${data.author}/status/${data.tweetId}`
    new TweetScraper(tweetUrl, data.tweetId).fetch()
        .then((thread) => {
            injectTweetsInTab(completedRequest.tabId, {
                threadId: data.tweetId,
                thread
            })
        })
}

// Catch any t.co link requests
chrome.webRequest.onBeforeRequest.addListener(function(tcoRequest){
    var filter = {
        urls: ['<all_urls>'],
        types: ['main_frame'],
        tabId: tcoRequest.tabId
    }
    // When the t.co link is resolved, check for the corresponding
    // tweet id and inject the associated twitter thread into the tab.
    function onCompletion(completed) {
        if (completed.url !== tcoRequest.url) {
            chrome.webRequest.onCompleted.removeListener(onCompletion, filter);
            injectTweetsForRequest(tcoRequest, completed);
        }
    }
    chrome.webRequest.onCompleted.addListener(onCompletion, filter)
},
{
    urls: ['*://*.t.co/*'],
    types: ['main_frame']
})



function saveTweetForInjection(data) {
    TweetsToInject[data.tcoLink] = data
}
export default saveTweetForInjection