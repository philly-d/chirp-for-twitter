import React from 'react'
import $ from 'jquery'

function killEvent (e) {
    e.preventDefault()
    e.stopPropagation()
    return false
}
function isWithinApp (el) {
    return $(el).closest('.twc-root').length > 0
}
function isInput (el) {
    return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.nodeName.toUpperCase()) > -1
}

const HighlightButton = React.createClass({

    getInitialState(){
        return {
            visible: false,
            position: null
        }
    },

    componentDidMount(){
        $(document)
            .on('mousedown', this.onMouseDown)
            .on('mouseup', this.onMouseUp)

    },

    componentWillUnmount(){
        $(document)
            .off('mousedown', this.onMouseDown)
            .off('mouseup', this.onMouseUp)
    },

    _containsElement(el){
        let ref = this.refs.highlightButton
        return ref && ref.contains(el)
    },


    onMouseDown(e) {
        if (!this.props.enabled) return


        const { target } = e
        let nextState = {
            ignoreMouseUp: isInput(target) || isWithinApp(target)
        }
        if (this._containsElement(target)) {
            killEvent(e)
        } else {
            nextState.visible = false
            nextState.position = null
        }
        
        this.setState(nextState)

    },

    updateSelection({ target, clientX, clientY }) {
        let selection = window.getSelection(),
            $el = $(target),
            left = Math.min($el.offset().left + $el.outerWidth(), window.innerWidth - 40),
            top = Math.min(clientY, window.innerHeight - 40)

        if (selection.toString().length) {
            this.setState({
                visible: true,
                position: {
                    left, top
                }
            })
        }
    },

    onMouseUp(e) {
        if (!this.props.enabled) return

        const { target } = e
        if (this._containsElement(target)) {
            return killEvent(e)
        }
        if (this.state.ignoreMouseUp || isInput(target) || isWithinApp(target)) {
            return
        }
        setTimeout(this.updateSelection.bind(this, {
            target: target,
            clientX: e.clientX,
            clientY: e.clientY,
        }), 1)

    },

    getPositionStyles() {
        if (this.state.visible && this.state.position) {
            return {
                display: 'block',
                ...this.state.position
            }
        } else {
            return { display: 'none' }
        }
    },

    render(){
        const { position } = this.state
        const visible = position && this.props.enabled && !this.props.isCropping
        let className = 'twc-quote-controller '
        className += visible ? 'is-controller-visible' : 'is-controller-hidden'

        return (
            <div ref='highlightButton' className={className} style={position}
                onClick={this.props.onClick}>
                <div className='twc-quote-button'>
                    <i className='twcicn twcicn-twitter-shot' />
                </div>
            </div>
        )
    }

})

export default HighlightButton