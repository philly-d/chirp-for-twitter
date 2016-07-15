import { delay, takeEvery } from 'redux-saga'
import { race, take, put, call, fork, select } from 'redux-saga/effects'
import {
    receiveThread, sendTweet, addTweet, setActiveTweet,
    showBanner, hideBanner,
    SEND_TWEET, HIDE_BANNER, SHOW_BANNER
} from '../actions'
import EmitAction from '../modules/actionEmitter'

// Show banner and hide it after a delay, unless interrupted
function* showBannerWithTimeout(banner) {
    try {
        yield put(showBanner(banner))
        const { interrupted, timeout } = yield race({
            interrupted: take([HIDE_BANNER, SHOW_BANNER]),
            timeout: call(delay, 5000)
        })
        if (!interrupted)
            yield put(hideBanner())
    } catch (err) {
        console.log('Failed to set banner', err, banner)
    }
}

// Send a tweet
function* sendTweetRequest(action) {
    yield put(sendTweet.request(action))

    try {
        const tweet = yield call(EmitAction, action)
        tweet.id = tweet.id_str
        
        const { inReplyTo } = action
        if (inReplyTo) {
            const threadId = yield select((state) => state.app.currentThreadId)
            yield put(addTweet({
                threadId,
                replyToId: inReplyTo,
                tweet: {
                    replyToId: inReplyTo,
                    ...tweet
                }
            }))
            yield put(setActiveTweet({
                threadId,
                tweet: tweet,
                forceFocus: false
            }))
        } else {
            yield put(receiveThread({
                threadId: tweet.id,
                thread: [tweet]
            }))
        }

        yield put(sendTweet.success(action, tweet))
        yield fork(showBannerWithTimeout, { tweet })
    } catch (error) {
        yield put(sendTweet.failure(action, error))
        if (error) {
            yield fork(showBannerWithTimeout, { error })
        }

        console.log('Failed to send tweet', error)
    }

}


export function* watchSendTweetRequests() {
    yield* takeEvery(SEND_TWEET, sendTweetRequest)
}