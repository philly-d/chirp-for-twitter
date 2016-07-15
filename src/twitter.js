import $ from 'jquery'

function processTweetLinkClicked($tweet, tco) {
    let handle = $tweet.attr('data-screen-name'),
        text = $tweet.find('.tweet-text').text(),
        tweetId = $tweet.attr('data-tweet-id'),
        msg = {
            type: 'tweetLinkClicked',
            data: {
                author: handle,
                tweetText: text,
                tcoLink: tco,
                tweetId: tweetId
            }
        }
    chrome.runtime.sendMessage(msg)
}


if (document.URL.indexOf('twitter.com/i/cards') > 0) {
    // Handle link clicks inside twitter card iframes
    $('a').click(function(e) {
        let tweetId = $('meta[name="tweet_id"]').attr('content'),
            tco = e.currentTarget.href,
            msg = {
                type: 'tweetLinkClicked',
                payload: {
                    url: tco,
                    tweetId: tweetId
                }
            }
        parent.postMessage(msg, '*')
    })
} else {
    // Handle link clicks on twitter timelines, and process
    // link clicks passed up from twitter card iframes.
    function receiveMessage(event) {
      if (event.data && event.data.type === 'tweetLinkClicked') {
        let tweetId = event.data.payload.tweetId;
        let $tweet = $('.tweet[data-item-id="' + tweetId + '"]');
        processTweetLinkClicked($tweet, event.data.payload.url);
      }
    }
    window.addEventListener("message", receiveMessage, false);

    $('body').click(function(e) {
        let $target = $(e.target).closest('a.twitter-timeline-link')
        if (!$target.length) return
        let $tweet = $target.closest('.tweet')
        if ($tweet.length)
            processTweetLinkClicked($tweet, $target.attr('href'))
    })
}





