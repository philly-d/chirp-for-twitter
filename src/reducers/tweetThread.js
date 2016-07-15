import { createSelector } from 'reselect'
import { combineReducers } from 'redux'
import _ from 'underscore'
import {
    ADD_TWEET, RECEIVE_TWEET_THREAD, SET_ACTIVE_TWEET, TWEET_SENT
} from '../actions'


function tweetThread(state={}, action) {
    switch (action.type) {
        case TWEET_SENT:
            return {
                ...state,
                activeTweet: null
            }
        case SET_ACTIVE_TWEET:
            const { tweet } = action
            return {
                ...state,
                activeTweet: tweet && tweet.id
            }
        case RECEIVE_TWEET_THREAD:
            const { threadId, thread } = action
            return {
                id: threadId,
                activeTweet: threadId,
                tweets: thread
            }
        case ADD_TWEET:
            const { replyToId } = action.tweet
            const { tweets } = state
            if (replyToId) {
                const index = _.findIndex(tweets, t => t.id === replyToId)
                if (index !== -1) {
                    let newThread = [...tweets]
                    newThread.splice(index+1, 0, action.tweet)
                    return {
                        ...state,
                        tweets: newThread
                    }
                }
            }
            return {
                ...state,
                tweets: [...tweets, action.tweet]
            }
        default:
            return state
    }
}

function threads(state={}, action) {
    switch (action.type) {
        default:
            const { threadId } = action
            if (threadId) {
                return {
                    ...state,
                    [threadId]: tweetThread(state[threadId], action)
                }
            }
            return state
    }
}

export const getCurrentThread = (state) => {
    return state.threads[
        state.app.currentThreadId
    ]
}
export const getActiveTweetId = (state) => {
    return state.app.activeTweet
}
export const getActiveTweet = createSelector(
    [ getCurrentThread, getActiveTweetId ],
    (currentThread, activeTweet) => {
        if (currentThread && activeTweet) {
            return currentThread.tweets.find(t => t.id === activeTweet)
        } else {
            return null
        }
    }
)
export default threads

