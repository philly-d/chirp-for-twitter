import $ from 'jquery'

function parseTweet($el, query) {
    if (query instanceof Array) {
        let result = {}
        query.forEach(function(q) {
            result[q.key] = parseTweet($el, q.value)
        })
        return result
    }
    if (query.selector)
        $el = $el.find(query.selector)
    if (query.parser)
        return query.parser($el, query)
    if (query.attr)
        return $el.attr(query.attr)
    return $el.text()
}

function getDisplayUrl(url) {
    let link = document.createElement('a')
    link.href = url
    const host = link.host.replace(/^www\./,'')
    let toDisplay = url.substring(url.indexOf(host))
    if (toDisplay.length > 35)
        return toDisplay.substring(0,30) + '...'
    else
        return toDisplay

}

const TweetMap = {
    id: {
        attr: 'data-tweet-id'
    },
    mentions: {
        parser: ($el) => {
            const mentions = $el.attr('data-mentions')
            return mentions ? mentions.split(' ') : []
        }
    },
    user: [
        {
            key: 'id',
            value: {
                attr: 'data-user-id'
            }
        },
        {
            key: 'name',
            value: {
                attr: 'data-name'
            }
        },
        {
            key: 'screen_name',
            value: {
                attr: 'data-screen-name'
            }
        },
        {
            key: 'permalink',
            value: {
                parser: ($el) => {
                    return 'https://twitter.com/' + $el.attr('data-screen-name')
                }
            }
        },
        {
            key: 'picture',
            value: {
                selector: '.avatar',
                attr: 'src'
            }
        }
    ],
    created_at: {
        selector: '.tweet-timestamp [data-time-ms]',
        parser: ($el) => new Date(parseInt($el.attr('data-time-ms'))).toUTCString()
    },
    permalink: {
        parser: ($el) => 'https://twitter.com' + $el.attr('data-permalink-path')
    }
    
}

class TweetScraper {

    constructor(url, tweetId) {
        this.tweetId = tweetId
        this.url = url
        this.data = []
    }

    fetch() {
        return $.get(this.url)
        .then((data) => {
            return this.parseTweets(data)
        })
    }

    parseTweet(tweet, replyTo) {
        const $tweet = $(tweet),
            textWrapper = tweet.querySelector('.tweet-text')
        if (!textWrapper) return

        let data = {},
            tweetText = '',
            entities = {
                hashtags: [],
                symbols: [],
                urls: [],
                user_mentions: []
            }
        for (var key in TweetMap) {
            data[key] = parseTweet($tweet, TweetMap[key])
        }
        if ($tweet.hasClass('promoted-tweet') && data.id !== this.tweetId) {
            // Ignore promoted tweets
            return
        }
        // Parse visible text and tweet entities
        textWrapper.childNodes.forEach(function(node){
            const $node = $(node),
                content = node.textContent
            if (node.nodeType === 3) {
                // Plain text node
                tweetText += content
                return
            }
            // Not a text node: parse tweet entity
            let offset = tweetText.length
            if ($node.hasClass('twitter-atreply')) {
                // User mention entity
                let id = $node.attr('data-mentioned-user-id'),
                    screen_name = content.substring(1)
                entities.user_mentions.push({
                    indices: [offset, offset + content.length],
                    id: id,
                    id_str: id,
                    name: screen_name,
                    screen_name: screen_name
                })
                tweetText += content
            } else if ($node.hasClass('twitter-hashtag')) {
                // Hashtag entity
                let hashtag = content.substring(1)
                entities.hashtags.push({
                    indices: [offset, offset + content.length],
                    text: hashtag
                })
                tweetText += content
            } else if ($node.hasClass('twitter-cashtag')) {
                // Cashtag entity
                let cashtag = content.substring(1)
                entities.symbols.push({
                    indices: [offset, offset + content.length],
                    text: cashtag
                })
                tweetText += content
            } else if ($node.hasClass('twitter-timeline-link')) {
                // Link entity
                const expanded_url = $node.attr('data-expanded-url') || content,
                    $displayUrl = $node.find('[class*="display-url"]'),
                    url = node.href,
                    isHidden = $node.hasClass('u-hidden')
                if (isHidden && tweetText.length) {
                    // Pad hidden link entity
                    tweetText += ' '
                    offset++
                }
                let display_url = $displayUrl.text()
                if (display_url && !expanded_url.endsWith(display_url)) {
                    // Append ellipsis to a cropped display url
                    display_url += '...'
                }
                entities.urls.push({
                    indices: [offset, offset + url.length],
                    display_url: display_url || getDisplayUrl(expanded_url),
                    expanded_url,
                    url
                })
                tweetText += url
            } else {
                tweetText += content
            }
        })
        data.text = tweetText
        data.entities = entities
        return data
    }

    parseTweets(html) {
        this.$root = $(html)
        let self = this,
            prevTweet,
            tweets = []
        this.$root.find('.tweet').each(function() {
            let tweet = self.parseTweet(this)
            if (tweet)
                tweets.push(tweet)
        })
        return tweets
    }

}
export default TweetScraper