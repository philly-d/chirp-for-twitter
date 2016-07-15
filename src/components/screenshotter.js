import React from 'react'
import HighlightButton from './highlightButton'
import Cropper from './cropper'

const Screenshotter = React.createClass({

    render() {
        const {
            canShowScreenshotButton, isCropping, isTakingScreenshot,
            initTakeScreenshot, hideScreenshotter, showScreenshotter
        } = this.props
        return (
            <div className='twc-screenshotter'>
                <Cropper
                    loading={isTakingScreenshot}
                    isCropping={isCropping}
                    takeScreenshot={initTakeScreenshot}
                    hide={hideScreenshotter}
                />
                <HighlightButton ref='highlightButton'
                    enabled={canShowScreenshotButton}
                    isCropping={isCropping}
                    onClick={showScreenshotter}
                />
            </div>)
    }
})


export default Screenshotter