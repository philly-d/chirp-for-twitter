import { createSelector } from 'reselect'
import { combineReducers } from 'redux'
import _ from 'underscore'
import {
    SEND_TWEET_REQUEST, SEND_TWEET_SUCCESS, SEND_TWEET_FAILURE,
    START_TWEET, CLOSE_APP, TOGGLE_APP_EXPANSION, RECEIVE_TWEET_THREAD,
    SHOW_BANNER, HIDE_BANNER, SET_ACTIVE_TWEET,
    SHOW_SCREENSHOTTER, HIDE_SCREENSHOTTER, DISABLE_SCREENSHOTTER,
    ENABLE_SCREENSHOTTER, SCREENSHOT_REQUEST, SCREENSHOT_SUCCESS, SCREENSHOT_FAILURE
} from '../actions'
import {
    ACTIVE_VIEW_THREAD, ACTIVE_VIEW_COMPOSER, ACTIVE_VIEW_NONE,
    DEFAULT_EDITOR_ID
} from '../constants'

export const activeViewIsThread = (state) => state.app.activeView === ACTIVE_VIEW_THREAD
export const activeViewIsComposer = (state) => state.app.activeView === ACTIVE_VIEW_COMPOSER

const initialState = {
    canShowScreenshotButton: true,
    isCropping: false,
    isExpanded: true,
    isTakingScreenshot: false,
    isSendingTweet: false,
    screenshotError: null,
    tweetSendError: null,
    activeTweet: null,
    currentThreadId: null,
    activeView: ACTIVE_VIEW_NONE,
    activeEditor: DEFAULT_EDITOR_ID,
    banner: {
        visible: false
    },
}
const app = (state=initialState, action) => {
    switch (action.type) {
        case RECEIVE_TWEET_THREAD:
            return {
                ...state,
                activeView: ACTIVE_VIEW_THREAD,
                activeTweet: action.threadId,
                currentThreadId: action.threadId,
                activeEditor: action.threadId
            }
        case SET_ACTIVE_TWEET:
            const { tweet } = action,
                tweetId = tweet && tweet.id
            return {
                ...state,
                activeEditor: tweetId,
                activeTweet: tweetId
            }
        case SHOW_BANNER:
            return {
                ...state,
                banner: {
                    ...action.banner,
                    visible: true
                }
            }
        case HIDE_BANNER:
            return {
                ...state,
                banner: {
                    ...state.banner,
                    visible: false
                }
            }
        case START_TWEET:
            return {
                ...state,
                activeView: ACTIVE_VIEW_COMPOSER,
                activeEditor: DEFAULT_EDITOR_ID
            }
        case TOGGLE_APP_EXPANSION:
            return {
                ...state,
                isExpanded: !state.isExpanded
            }
        case CLOSE_APP:
            return {
                ...state,
                activeView: ACTIVE_VIEW_NONE,
                isExpanded: true
            }
        case SEND_TWEET_REQUEST:
            return {
                ...state,
                isSendingTweet: true
            }
        case SEND_TWEET_SUCCESS:
        case SEND_TWEET_FAILURE:
            return {
                ...state,
                isSendingTweet: false
            }
        case SCREENSHOT_REQUEST:
            return {
                ...state,
                isTakingScreenshot: true
            }
        case SCREENSHOT_FAILURE:
            return {
                ...state,
                isTakingScreenshot: false
            }
        case SCREENSHOT_SUCCESS:
            return {
                ...state,
                isCropping: false,
                isTakingScreenshot: false
            }
        case ENABLE_SCREENSHOTTER:
            return {
                ...state,
                canShowScreenshotButton: true
            }
        case DISABLE_SCREENSHOTTER:
            return {
                ...state,
                isCropping: false,
                canShowScreenshotButton: false
            }
        case SHOW_SCREENSHOTTER:
            return {
                ...state,
                canShowScreenshotButton: true,
                isCropping: true
            }
        case HIDE_SCREENSHOTTER:
            return {
                ...state,
                isCropping: false
            }
        default:
            return state
    }
}

export default app

