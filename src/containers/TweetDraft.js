import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
    setEditorState, activateEditorState, selectAutocompleteItem,
    updateAutocompleteIndex, removeScreenshot, initiateLogin, initSendTweet
} from '../actions'
import { getEditorState } from '../reducers/tweet'
import { getActiveTweet } from '../reducers/tweetThread'
import { selectedItem, autocompleteIsActive } from '../reducers/autocomplete'
import TweetEditor from '../components/tweetEditor'

function mapStateToProps (state, props) {
    return {
        isSendingTweet: state.app.isSendingTweet,
        editorState: getEditorState(state, props),
        autocompleteIsActive: autocompleteIsActive(state),
        selectedItem: selectedItem(state),
        screenshot: state.screenshots,
        authenticated: state.user.authenticated,
    }
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        setEditorState, activateEditorState, selectAutocompleteItem,
        updateAutocompleteIndex, removeScreenshot, initiateLogin, initSendTweet
    }, dispatch)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TweetEditor)
