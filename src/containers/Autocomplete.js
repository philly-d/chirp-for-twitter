import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { selectAutocompleteItem, updateAutocompleteIndex } from '../actions'
import { ACTIVE_VIEW_THREAD } from '../constants'
import { activeViewIsThread } from '../reducers/app'
import { autocompleteIsActive } from '../reducers/autocomplete'
import AutocompleteList from '../components/autocompleteList'

function mapStateToProps (state) {
    return {
        autocomplete: state.autocomplete,
        visible: autocompleteIsActive(state),
        replyingTo: activeViewIsThread(state) && state.app.activeTweet,
    }
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        selectAutocompleteItem, updateAutocompleteIndex
    }, dispatch)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AutocompleteList)
