import { takeEvery } from 'redux-saga'
import { select, call, fork, put } from 'redux-saga/effects'
import { getActiveTweet } from '../reducers/tweetThread'
import {
    SET_ACTIVE_TWEET, START_TWEET, RECEIVE_TWEET_THREAD,
    activateEditorState
} from '../actions'

// Force focus on a new tweet
function* activateComposerEditor() {
    yield put(activateEditorState({ forceFocus: true }))
}
function* activateReplyEditor({ tweet, forceFocus }) {
    yield put(activateEditorState({
        tweet,
        forceFocus
    }))
}
// Force focus on a tweet reply with auto-prefilled text
function* activateActiveThreadEditor() {
    const tweet = yield select(getActiveTweet)
    if (tweet)
        yield call(activateReplyEditor, { tweet })
}


function* ensureEditorInitialization() {
    yield fork(takeEvery, START_TWEET, activateComposerEditor)
    yield fork(takeEvery, SET_ACTIVE_TWEET, activateReplyEditor)
    yield fork(takeEvery, RECEIVE_TWEET_THREAD, activateActiveThreadEditor)
}

export default ensureEditorInitialization