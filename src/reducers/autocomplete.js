import { createSelector } from 'reselect'
import { combineReducers } from 'redux'
import _ from 'underscore'
import {
    SET_EDITOR_STATE, RESET_AUTOCOMPLETE, SELECT_AUTOCOMPLETE_ITEM,
    UPDATE_AUTOCOMPLETE_INDEX, SET_AUTOCOMPLETE_LIST, RECEIVE_FRIENDS, SET_AUTOCOMPLETE_TERM 
} from '../actions'
import twitterText from 'twitter-text'

// Returns a twitter mention if the text selection cursor
// is focused within one, so that we can initiate an autocomplete
// search.
function getActiveMention (text, cursor) {
    const mentions = twitterText.extractMentionsWithIndices(text)
    for (var i in mentions) {
        let mention = mentions[i]
        if (mention.indices[0] < cursor && mention.indices[1] >= cursor) {
            return {
                indices: mention.indices,
                term: mention.screenName
            }
        }
    }
    return {
        term: ''
    }
}
export function getAutocompleteTerm (editorState) {
    const selection = editorState.getSelection(),
        content = editorState.getCurrentContent(),
        block = content.getBlockForKey(selection.getEndKey()),
        text = block.getText()
    return getActiveMention(text, selection.getEndOffset())
}

function filterList (list, term) {
    if (!term || !list.length) return []
    let nameRegex = new RegExp('\\b' + term, 'i'),
        snRegex = new RegExp('^' + term, 'i'),
        matchIndices = {}
    return list.filter(function(friend){
        return nameRegex.test(friend.name) || snRegex.test(friend.screen_name)
    })
}

const initialState = {
    term: '',
    list: [],
    filtered: [],
    selectedIndex: 0,
    editorIndices: null
}

function autocomplete(state=initialState, action) {
    let filtered
    switch(action.type) {
        case SET_EDITOR_STATE:
            const { editorState } = action,
                { term } = getAutocompleteTerm(editorState)

            if (term === state.term) {
                return state
            }
            filtered = filterList(state.list, term)
            return {
                ...state,
                filtered,
                term: term,
                selectedIndex: 0
            }
        case RESET_AUTOCOMPLETE:
        case SELECT_AUTOCOMPLETE_ITEM:
            return {
                ...state,
                term: '',
                filtered: [],
                selectedIndex: 0,
                editorIndices: null
            }
        case UPDATE_AUTOCOMPLETE_INDEX:
            const { index, offset } = action
            let nextIndex = offset ? (state.selectedIndex + offset) : index
            return {
                ...state,
                selectedIndex: Math.min(Math.max(0, nextIndex), state.filtered.length-1)
            }
        case SET_AUTOCOMPLETE_LIST:
        case RECEIVE_FRIENDS:
            filtered = filterList(action.list, state.term)
            return {
                ...state,
                filtered,
                list: action.list,
                selectedIndex: 0
            }
        case SET_AUTOCOMPLETE_TERM:
            if (action.term === state.term)
                return state
            filtered = filterList(state.list, action.term)
            return {
                ...state,
                filtered,
                term: action.term,
                editorIndices: action.indices,
                selectedIndex: 0
            }
        default:
            return state
    }
}


export const autocompleteIsActive = (state) => state.autocomplete.filtered.length > 0
export const getFilteredList = (state) => state.autocomplete.filtered
export const getSelectedIndex = (state) => state.autocomplete.selectedIndex
export const selectedItem = createSelector(
    [getFilteredList, getSelectedIndex],
    (list, index) => list[index]
)

export default autocomplete

