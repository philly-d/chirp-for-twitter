import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { setActiveTweet } from '../actions'
import { getCurrentThread } from '../reducers/tweetThread'
import { getFilteredList } from '../reducers/autocomplete'
import Thread from '../components/thread'

function mapStateToProps (state) {
    return {
        thread: getCurrentThread(state),
        filteredList: getFilteredList(state)
    }
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({ setActiveTweet }, dispatch)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Thread)
