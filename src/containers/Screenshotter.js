import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
    initTakeScreenshot, hideScreenshotter, showScreenshotter
} from '../actions'
import Screenshotter from '../components/screenshotter'

function mapStateToProps (state, props) {
    return state.app
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        initTakeScreenshot, hideScreenshotter, showScreenshotter
    }, dispatch)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Screenshotter)
