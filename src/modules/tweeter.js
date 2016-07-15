import co from 'co'
import TwitterAPI from './requestor'
import { RUNTIME_REQUEST_SUCCESS, RUNTIME_REQUEST_FAILURE } from '../constants'

// Set extra values on the tweet
// TODO: Put this somewhere more logical in content-script
function parseTweet (tweet) {
    if (!tweet) return
    tweet.id = tweet.id_str // See https://dev.twitter.com/overview/api/twitter-ids-json-and-snowflake
    tweet.mentions = tweet.entities.user_mentions.map(m => m.screen_name)
    tweet.permalink = 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id
    tweet.user.permalink = 'https://twitter.com/' + tweet.user.screen_name
    tweet.user.picture = tweet.user.profile_image_url
    return tweet
}

function postTweet (toSend) {
    return TwitterAPI.sendTweet(toSend)
    .then(parseTweet)
}

export function uploadMedia (screenshot) {
    if (screenshot.media_id_string)
        return Promise.resolve(screenshot.media_id_string)

    return TwitterAPI.uploadImage(screenshot.dataUrl)
    .then((res) => {
        return res.media_id_string
    })
}

// Send tweet, optionally uploading images beforehand
export const sendTweet = co.wrap(function*(tweetData, sendResponse) {
    const { screenshot, inReplyTo, status } = tweetData
    let toSend = {
        status: status
    }
    
    if (inReplyTo)
        toSend.in_reply_to_status_id = inReplyTo.toString()
    
    try {
        if (screenshot) {
            toSend.media_ids = yield uploadMedia(screenshot)
        }
        const tweet = postTweet(toSend)

        return tweet
    } catch (error) {
        throw error
    }

})



