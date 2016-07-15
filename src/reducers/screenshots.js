import {
    SEND_TWEET_SUCCESS,
    TWEET_SENT, RECEIVE_SCREENSHOT, UPDATE_SCREENSHOT, REMOVE_SCREENSHOT,
} from '../actions'


const initialScreenshotState = null
const screenshots = (state=initialScreenshotState, action) => {
    const { screenshotId } = action
    switch (action.type) {
        case SEND_TWEET_SUCCESS: // Reset screenshots
            return initialScreenshotState
        case UPDATE_SCREENSHOT:
            if (state && state.id === screenshotId) {
                return {
                    ...state,
                    ...action.screenshot
                }
            } else {
                return state
            }
        case RECEIVE_SCREENSHOT:
            return {
                id: screenshotId,
                ...action.screenshot
            }
        case REMOVE_SCREENSHOT:
            return initialScreenshotState
        default:
            return state
    }
}


export default screenshots