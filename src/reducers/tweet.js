import React from 'react'
import { combineReducers } from 'redux'
import twitterText from 'twitter-text'
import _ from 'underscore'
import { getAutocompleteTerm } from './autocomplete'
import {
    CompositeDecorator,
    ContentState,
    Editor,
    EditorState,
    getDefaultKeyBinding,
    KeyBindingUtil,
    SelectionState,
    Modifier,
    Entity,
    RichUtils,
    AtomicBlockUtils
} from 'draft-js'

import {
    SET_ACTIVE_TWEET, ACTIVATE_EDITOR_STATE, CLOSE_APP,
    SEND_TWEET_SUCCESS, SEND_TWEET_FAILURE, SEND_TWEET_REQUEST,
    TWEET_SENT, SET_EDITOR_STATE, RECEIVE_SCREENSHOT, UPDATE_SCREENSHOT, REMOVE_SCREENSHOT, SELECT_AUTOCOMPLETE_ITEM
} from '../actions'


const DEFAULT_EDITOR_ID = 'DEFAULT_EDITOR_ID'

function emptyEditorState (editorState) {
    let contentState = editorState.getCurrentContent()
    const firstBlock = contentState.getFirstBlock()
    const lastBlock = contentState.getLastBlock()
    const allSelected = new SelectionState({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: lastBlock.getKey(),
        focusOffset: lastBlock.getLength(),
        hasFocus: true
    })
    contentState = Modifier.removeRange(contentState, allSelected, 'backward')
    return EditorState.push(editorState, contentState, 'remove-range')
    // return EditorState.forceSelection(contentState, contentState.getSelectionAfter())
}

// Match tweet entities (mentions, hashtags, cashtags)
function entityStrategy (contentBlock, callback) {
    const text = contentBlock.getText(),
        matches = twitterText.extractEntitiesWithIndices(text)
    matches.forEach(function(match){
        if (!match.url) // Ignore urls -- different strategy
            callback(match.indices[0], match.indices[1])
    })
}
function entitySpan (props) {
    return <span className='twc-editor-entity' {...props}>{props.children}</span>
}
// Match urls in tweet content
function linkStrategy (contentBlock, callback) {
    const text = contentBlock.getText(),
        matches = twitterText.extractUrlsWithIndices(text)
    matches.forEach(function(match){
        callback(match.indices[0], match.indices[1])
    })
}
function linkSpan (props) {
    return <span className='twc-editor-link' {...props}>{props.children}</span>
}
// Default tweet decorators for editor states
const entityDecorator = {
    strategy: entityStrategy,
    component: entitySpan,
}
const linkDecorator = {
    strategy: linkStrategy,
    component: linkSpan
}
const tweetDecorator = new CompositeDecorator([entityDecorator, linkDecorator])

// Default empty editor state with tweet decorator
function createEmptyEditor() { return EditorState.createEmpty(tweetDecorator) }

// Focus at end of editorState
function focusEnd (editorState, force) {
    if (force) {
        return EditorState.moveFocusToEnd(editorState)
    } else {
        return EditorState.moveSelectionToEnd(editorState)
    }
}

// Default reply tweet text includes the screen names
// of tweet creator + any users mentioned in it
function setDefaultReplyText (editorState, tweet) {
    const mentions = _.uniq([tweet.user.screen_name].concat(tweet.mentions).map(function(i){
            return '@' + i
        })),
        newText = mentions.join(' ') + ' ',
        newContent = ContentState.createFromText(newText),
        newState = EditorState.createWithContent(newContent, tweetDecorator)

    return focusEnd(newState, true)
}

// Default new tweet text is the URL + a @get_chirp attribution,
// with focus at the very beginning of the tweet so user can
// add a comment before the link/screenshot content.
function createDefaultEditor (forceFocus) {
    const contentState = ContentState.createFromText('\n' + document.URL + ' via @Get_Chirp'),
        { selectionBefore } = contentState,
        editorState = EditorState.createWithContent(contentState, tweetDecorator)
    if (forceFocus) {
        return EditorState.forceSelection(editorState, selectionBefore)
    } else {
        return EditorState.acceptSelection(editorState, selectionBefore)
    }
}

// Replace user's in-progress @mention with the selected
// @mention from autocomplete.
function insertAutocompleteItem (editorState, action) {
    const { indices } = getAutocompleteTerm(editorState)
    if (!indices) return editorState
    const { item } = action,
        nextFocus = indices[0] + item.screen_name.length + 2,
        nextContent = Modifier.replaceText(
            editorState.getCurrentContent(),
            editorState.getSelection().merge({
                anchorOffset: indices[0],
                focusOffset: indices[1]
            }),
            `@${item.screen_name} `
        ),
        nextEditor = EditorState.push(
            editorState,
            nextContent,
            'insert-characters')

    return EditorState.forceSelection(
        nextEditor,
        nextEditor.getSelection().merge({
            anchorOffset: nextFocus,
            focusOffset: nextFocus
        })
    )
}

function tweetDraft(state, action) {
    if (typeof state === 'undefined')
        state = createEmptyEditor()
    // Editor is immutable so we can perform changes directly on state
    let editorState = state
    switch (action.type) {
        case ACTIVATE_EDITOR_STATE:
            const { tweet, forceFocus } = action,
                currText = editorState.getCurrentContent().getPlainText()
            if (tweet) {
                if (forceFocus) {
                    if (currText) {
                        editorState = focusEnd(editorState, true)
                    } else {
                        editorState = setDefaultReplyText(editorState, tweet)
                    }
                }
            } else {
                if (!currText) {
                    editorState = createDefaultEditor(focus)
                } else if (focus) {
                    editorState = focusEnd(editorState, true)
                }
            }
            return editorState
        case CLOSE_APP:
        case SEND_TWEET_SUCCESS:
            return createEmptyEditor()
        case SELECT_AUTOCOMPLETE_ITEM:
            return insertAutocompleteItem(state, action)
        case SET_EDITOR_STATE:
            return action.editorState
        default:
            return state
    }
}


function drafts(state={}, action) {
    let tweetId
    switch (action.type) {
        case CLOSE_APP:
            tweetId = DEFAULT_EDITOR_ID
            return {
                ...state,
                [tweetId]: tweetDraft(state[tweetId], action)
            }
        case SEND_TWEET_SUCCESS:
            const { request } = action
            const { inReplyTo } = request
            tweetId = inReplyTo || DEFAULT_EDITOR_ID
            return {
                ...state,
                [tweetId]: tweetDraft(state[tweetId], action)
            }
        case SELECT_AUTOCOMPLETE_ITEM:
        case SET_EDITOR_STATE:
            tweetId = action.replyToId || DEFAULT_EDITOR_ID
            return {
                ...state,
                [tweetId]: tweetDraft(state[tweetId], action)
            }
        case ACTIVATE_EDITOR_STATE:
            const { tweet } = action
            tweetId = tweet ? tweet.id : DEFAULT_EDITOR_ID
            return {
                ...state,
                [tweetId]: tweetDraft(state[tweetId], action)
            }
        default:
            return state

    }
}

export const getEditorState = (state, props) => {
    const id = props.replyTo ? props.replyTo.id : DEFAULT_EDITOR_ID
    let editor = state.drafts[id]
    return editor
}

export default drafts





