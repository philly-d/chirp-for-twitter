import React from 'react'
import NewTweet from './newTweet'
import Banner from './banner'
import CurrentThread from '../containers/Thread'
import Screenshotter from '../containers/Screenshotter'
import Autocomplete from '../containers/Autocomplete'
import {
    ACTIVE_VIEW_THREAD, ACTIVE_VIEW_COMPOSER, ACTIVE_VIEW_NONE
} from '../constants'

const ActiveViews = {
    [ACTIVE_VIEW_THREAD]: {
        title: 'Tweets',
        Component: CurrentThread
    },
    [ACTIVE_VIEW_COMPOSER]: {
        title: 'Compose Tweet',
        Component: NewTweet
    },
}

const App = React.createClass({

    onCloseClick(e){
        this.props.closeApp()
        e.stopPropagation()
    },


    onBannerClick(){
        setTimeout(this.props.hideBanner)
    },

    renderActiveView() {
        const activeView = ActiveViews[this.props.activeView]
        if (!activeView) return

        const { title, Component } = activeView,
            activeClasses = 'twc-active-view' + (this.props.isExpanded ? ' twc-is-expanded' : '')

        return (<div className='twc-app'>
            <Autocomplete />
            <div className='twc-toolbar' onClick={this.props.toggleAppExpansion}>
                <div className='twc-toolbar-title'>
                    { title }
                </div>
                <div className='twc-toolbar-close' onClick={this.onCloseClick}>
                    <i className="twcicn twcicn-x" />
                </div>
            </div>
            <div className={activeClasses}>
                <Banner banner={this.props.banner} onClick={this.onBannerClick} />
                <Component />
            </div>
        </div>)
    },

    render(){
        const rootClass = 'twc-root'
        return (<div className={rootClass}>
            {
                this.renderActiveView()
            }
            <Screenshotter />
        </div>)
    }  
})

export default App
