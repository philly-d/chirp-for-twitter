import React from 'react'
import ReactTooltip from 'react-tooltip'

const ScreenshotDisplay = (props) => {
    const { screenshot, removeScreenshot } = props
    if (screenshot) {
        // Render screenshot + expanded tooltip (hover-activated)
        const { dataUrl, id } = screenshot
        return (
            <div className='twc-screenshot-display'>
                <img src={dataUrl} className='twc-screenshot-item' data-tip data-for='twc-shot-expanded' />
                <div className='twc-close-button' onClick={e => removeScreenshot(id)}>
                    <i className='twcicn twcicn-x' />
                </div>
                <ReactTooltip id='twc-shot-expanded' place="left" type="dark" effect="solid">
                    <img src={dataUrl} className='twc-screenshot-expanded' />
                </ReactTooltip>
            </div>
        )
    }
    return (
        // Show screenshot tutor
        <div>
            <div data-tip data-for='twc-shot-tutor'>
                <i className='twcicn twcicn-twitter-shot twitter-shot-tutor'/>
            </div>
            <ReactTooltip id='twc-shot-tutor' place="bottom" type="dark" effect="solid">
                Highlight text to add a screenshot
            </ReactTooltip>
        </div>
    )

}

export default ScreenshotDisplay