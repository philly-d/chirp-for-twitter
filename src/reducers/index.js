import { combineReducers } from 'redux'
import threads from './tweetThread'
import drafts from './tweet'
import autocomplete from './autocomplete'
import user from './user'
import app from './app'
import screenshots from './screenshots'

export default combineReducers({
    threads,
    drafts,
    screenshots,
    autocomplete,
    user,
    app
})