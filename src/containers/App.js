import { bindActionCreators } from 'redux'
import React from 'react'
import { connect } from 'react-redux'
import { toggleAppExpansion, closeApp, hideBanner } from '../actions'
import { getCurrentThread } from '../reducers/tweetThread'
import App from '../components/app'

function mapStateToProps (state) {
    return state.app
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        toggleAppExpansion, closeApp, hideBanner
    }, dispatch)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
