import React from 'react'
import ReactDOM from 'react-dom'
import Draft from 'draft-js'
import twitterText from 'twitter-text'
import ScreenshotDisplay from './screenshotDisplay'
import TweetToolbar from './tweetToolbar'
import _ from 'underscore'
const {
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
} = Draft;


// Hack to ignore React's contentEditable warning, conflicting with Draft-js.
// Source: https://github.com/facebook/draft-js/issues/53#issuecomment-188280259
// TODO: Upgrade to React 15, where this is fixed.
console.error = (function() {
    var error = console.error
    return function(exception) {
        if ((exception + '').indexOf('Warning: A component is `contentEditable`') != 0) {
            error.apply(console, arguments)
        }
    }
})()

class TweetEditor extends React.Component {

    constructor(props) {
        super(props)

        const { replyTo } = props
        if (replyTo) {
            const mentions = _.uniq([replyTo.user.screen_name]
                .concat(replyTo.mentions).map(function(i){
                    return '@' + i
                }))
            this.placeholder = "Reply to " + mentions.join(' ')
        } else {
            this.placeholder = "What's happening?"
        }

        this.onTweetButtonClick = this.onTweetButtonClick.bind(this)
        this.onFocusClick = this.onFocusClick.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onUpArrow = this.onUpArrow.bind(this)
        this.onDownArrow = this.onDownArrow.bind(this)
        this.handleReturn = this.handleReturn.bind(this)
        this.onTab = this.onTab.bind(this)
        
    }

    updateEditorState(editorState) {
        this.props.setEditorState(editorState, this.getParentId())
    }

    focus() {
        this.refs.editor && this.refs.editor.focus()
    }

    onFocusClick(e) {
        e.stopPropagation()
        const { editorState, replyTo } = this.props,
            text = editorState.getCurrentContent().getPlainText()
        if (!text && replyTo) {
            e.preventDefault()
            this.props.activateEditorState({
                tweet: replyTo,
                forceFocus: true
            })
            return false
        } else {
            this.focus()
        }
        
    }

    onChange(editorState) {
        this.updateEditorState(editorState)
    }

    getParentId() {
        return this.props.replyTo && this.props.replyTo.id
    }

    selectAutocompleteItem() {
        const { selectedItem } = this.props
        if (selectedItem) {
            this.props.selectAutocompleteItem({
                item: selectedItem,
                replyToId: this.getParentId()
            })
            return true
        }
        return false
    }

    handleReturn(e) {
        if (this.selectAutocompleteItem())
            return true
    }

    handleArrowEvent(e, offset) {
        if (this.props.autocompleteIsActive) {
            this.props.updateAutocompleteIndex({offset})
            e.preventDefault()
        }
    }

    onUpArrow(e) {
        this.handleArrowEvent(e, -1)
    }
    onDownArrow(e) {
        this.handleArrowEvent(e, 1)
    }

    onTab(e) {
        if (this.selectAutocompleteItem())
            e.preventDefault()
    }

    onTweetButtonClick() {
        const {
            authenticated, screenshot, editorState, initiateLogin, initSendTweet
        } = this.props
        if (authenticated) {
            initSendTweet({
                status: editorState.getCurrentContent().getPlainText(),
                inReplyTo: this.getParentId(),
                screenshot
            })
        } else {
            initiateLogin()
        }
    }

    render() {
        const { editorState, screenshot, authenticated,
            removeScreenshot, isSendingTweet } = this.props
        let editor
        if (editorState) {
            editor = (<div onClick={this.onFocusClick} className='twc-editor'>
                <Editor
                  editorState={editorState}
                  onChange={this.onChange}
                  placeholder={this.placeholder}
                  ref="editor"
                  stripPastedStyles={true}
                  onDownArrow={this.onDownArrow}
                  onUpArrow={this.onUpArrow}
                  handleReturn={this.handleReturn}
                  onTab={this.onTab}
                />
            </div>)
        }
        return (
            <div className='twc-editor-container'>
                { editor }
                <div className='twc-editor-footer'>
                    <ScreenshotDisplay screenshot={screenshot} removeScreenshot={removeScreenshot} />
                    <TweetToolbar
                        isSendingTweet={isSendingTweet}
                        authenticated={authenticated}
                        editorState={editorState}
                        screenshot={screenshot}
                        onClick={this.onTweetButtonClick}
                    />
                </div>
            </div>
        );
    }
}

export default TweetEditor;

