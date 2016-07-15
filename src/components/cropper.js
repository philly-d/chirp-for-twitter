import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import ResizableAndMovable from './resizableAndMovable' // Patched component

const query = (sel) => document.querySelector(sel)
const getMeta = (name) => query(`meta[name="${name}"]`)
const getLink = (rel) => query(`link[rel="${rel}"]`)
function metaInfo() {
    let metaInfo = {
        siteName: document.location.hostname.replace(/^www\./,''),
        url: document.URL,
        title: document.title,
        favicon: 'https://www.google.com/s2/favicons?domain=' + document.URL
    }
    let favicon = getLink('shortcut icon') || getLink('icon')
    if (favicon) metaInfo.favicon = favicon.href
    let siteName = getMeta('og:site_name')
    if (siteName) metaInfo.siteName = siteName.content
    let title = getMeta('og:title')
    if (title) metaInfo.title = title.content
    return metaInfo
}

function copyBoundingClientRect (obj) {
    const rect = obj.getBoundingClientRect()
    return {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
    }
}
function getClosestBlock (el) {
    const { display } = getComputedStyle(el)
    return /(block|table|list)/.test(display) ? el : getClosestBlock(el.parentNode)
}
function getCurrentRange () {
    const selection = document.getSelection()
    return selection.isCollapsed ? null : selection.getRangeAt(0)
}
function isPartiallyVisible (el) {
    const rect = el.getBoundingClientRect()
    return (
        rect.top >= 0 || rect.left >= 0 ||
        rect.bottom <= window.innerHeight || rect.right <= window.innerWidth
    )
}
const MAX_Z_INDEX = 2147483647
const MIN_CROP_HEIGHT = 100
const MIN_CROP_WIDTH = 165
const CROP_BTN_HEIGHT = 45
const MIN_CROP_HEIGHT_W_BTN = MIN_CROP_HEIGHT + CROP_BTN_HEIGHT
const CROP_META_HEIGHT = 56
const DEFAULT_CROP_RECT = {
    top: 100,
    left: 100,
    width: 500,
    height: 200
}
const CROP_AREA_REF = 'CROP_AREA_REF'

const Cropper = React.createClass({

    getInitialState(){
        return {
            visible: false,
            saving: false,
            bounds: null
        }
    },

    componentDidMount(){
        $(document)
            .on('mousedown', this.onMouseDown)
            .on('contextmenu', this.onContextMenuClick)
    },

    componentWillUnmount(){
        $(document)
            .off('mousedown', this.onMouseDown)
            .off('contextmenu', this.onContextMenuClick)
    },

    onContextMenuClick(e) {
        const evt = {
            target: e.target,
            range: getCurrentRange()
        }
        this._lastContextMenuClick = evt
        setTimeout(() => {
            if (this._lastContextMenuClick === evt) {
                delete this._lastContextMenuClick
            }
        }, 15000)
    },

    componentWillReceiveProps(props){
        if (props.isCropping && !this.props.isCropping)
            this.setBoundsForSelection()
        if (!props.loading && this.props.loading)
            this.setState({
                saving: false
            })
    },

    // If cropper is to be shown, attempt to get
    // dimensions for the crop box.
    getBoundsForSelectionTarget() {
        const currentRange = getCurrentRange()
        if (currentRange) {
            // Use the current text selection on page
            // to get the box dimensions
            return copyBoundingClientRect(currentRange)
        }

        if (this._lastContextMenuClick) {
            // User initiated this via context-menu click.
            // Attempt to get a screenshottable area from
            // the clicked element.
            const { target, range } = this._lastContextMenuClick
            if (range) {
                return copyBoundingClientRect(range)
            }
            const block = getClosestBlock(target)
            if (block && isPartiallyVisible(block)) {
                return copyBoundingClientRect(block)
            }
        }

        // Use default rect if all else fails
        return {...DEFAULT_CROP_RECT}
    },

    setBoundsForSelection() {
        try {
            let rect = this.getBoundsForSelectionTarget()
            // Pad the selection
            rect.left -= 15
            rect.width += 30
            rect.top -= 50
            rect.height += 100

            // Accounting for bottom content (buttons, meta)
            rect.height += CROP_META_HEIGHT + CROP_BTN_HEIGHT

            // Adjust to fit viewport and min dimensions
            if (rect.top < 0) {
                rect.height += rect.top
                rect.top = 0
            }
            if (rect.left < 0) {
                rect.width += rect.left
                rect.left = 0
            }
            rect.width = Math.max(rect.width, 165)
            rect.height = Math.max(rect.height, 100)
            
            if (rect.top + rect.height > window.innerHeight) {
                rect.height = window.innerHeight - rect.top
                if (rect.height < MIN_CROP_HEIGHT_W_BTN) {
                    rect.height = MIN_CROP_HEIGHT_W_BTN
                    if (rect.top + rect.height > window.innerHeight) {
                        rect.top = window.innerHeight - rect.height
                    }
                }
            }
            if (rect.left + rect.width > window.innerWidth) {
                rect.width = window.innerWidth - rect.left
                if (rect.width < MIN_CROP_WIDTH) {
                    rect.width = MIN_CROP_WIDTH
                    if (rect.left + rect.width > window.innerWidth) {
                        rect.left = window.innerWidth - rect.width
                    }
                }
            }
            // Subtract height of buttons since not in crop area
            rect.height -= CROP_BTN_HEIGHT

            this.setState({
                renderMeta: true,
                bounds: rect,
                visible: true
            })
        } catch (err) {
            // Something went wrong and we should cancel screenshot flow
            this.hide()
        }
    },


    // Prevent loss of text selection as crop box is dragged
    onMouseDown(e) {
        let ref = this.refs.wrapper
        if (ref && ref.contains(e.target)) return false
    },


    hide(cb){
        this.setState({
            visible: false,
            saving: false
        }, cb)

        this.props.hide()
    },

    onCancelClick(){
        this.hide()
    },

    onScreenshotClick(){
        let cropArea = this.refs[CROP_AREA_REF]
        if (!cropArea) {
            this.hide()
            return
        }
        if (!this.state.saving) {
            let rect = copyBoundingClientRect(cropArea)
            // Cement crop box display for screenshotting (hide X on meta info)
            this.setState({
                saving: true
            }, () => {
                // Delay screenshot to ensure chrome has
                // up-to-date render.
                setTimeout(
                    this.saveScreenshot.bind(this, rect),
                100)
            })
        }
        return
    },

    saveScreenshot(rect) {
        // Might have to use this if crop box border
        // is visible in screenshotted view
        const borderWidth = 0
        this.props.takeScreenshot({
            devicePixelRatio: window.devicePixelRatio,
            zoom: (document.documentElement.clientWidth/window.innerWidth),
            windowDimensions: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            selection: window.getSelection().toString(),
            rect: {
                top: rect.top + borderWidth,
                left: rect.left + borderWidth,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width - 2*borderWidth,
                height: rect.height - 2*borderWidth,
            },
            id: Date.now()
        })
    },

    onCloseMetaClick() {
        this.setState({
            renderMeta: false
        })
    },

    renderMeta() {
        const meta = metaInfo()
        return (
            <div className='twc-crop-meta-wrapper'>
                <div className='twc-crop-meta-content'>
                    <div className='twc-crop-meta-favicon'>
                        <img src={ meta.favicon }/>
                    </div>
                    <div>
                        <div className='twc-crop-meta-sitename'>
                            { meta.siteName }
                        </div>
                        <div className='twc-crop-meta-title'>
                            { meta.title }
                        </div>
                    </div>
                </div>
                <div className='twc-crop-meta-close' onClick={this.onCloseMetaClick}>
                    <i className="twcicn twcicn-x" />
                </div>
            </div>
        )
    },

    render() {
        const { bounds, saving, renderMeta } = this.state
        
        if (!this.props.isCropping || !bounds) {
            return <div style={{display: 'none'}} />
        }

        const meta = renderMeta ? this.renderMeta() : null,
            boxProps = {
                x: bounds.left,
                y: bounds.top,
                width: bounds.width,
                height: bounds.height
            }

        let wrapperClass = 'twc-cropper-container'
        if (this.props.loading || saving) {
            wrapperClass += ' twc-cropper-is-saving'
        }
        return (<div ref={'wrapper'} className={wrapperClass}>
            <ResizableAndMovable
                canUpdateSizeByParent={true}
                enableUserSelectHack={false}
                minWidth={MIN_CROP_WIDTH}
                minHeight={MIN_CROP_HEIGHT}
                zIndex={MAX_Z_INDEX}
                {...boxProps}
                >
                    <div className='twc-cropper'>
                        <div // Blank first child is used for rendering crop corners
                        />
                        <div className='twc-crop-area' ref={CROP_AREA_REF}/>
                        { meta }
                    </div>
                    <div className='twc-screenshot-btn-bar'>
                        <div className="twc-screenshot-btn twc-cancel-btn"
                            onClick={this.onCancelClick}>
                            <i className="twcicn twcicn-x" />
                        </div>
                        <div className="twc-screenshot-btn twc-save-btn"
                            onClick={this.onScreenshotClick}>
                            <div className="twc-loading">
                                <div className="twc-loading-spinner" />
                            </div>
                            Screenshot <i className="twcicn twcicn-caret-r"/>
                        </div>
                    </div>
            </ResizableAndMovable>
        </div>)
    }
})

export default Cropper
