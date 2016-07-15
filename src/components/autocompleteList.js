import React from 'react'
import ReactDOM from 'react-dom'


const AutocompleteItem = (props) => {
    const { selected, onClick, item, onMouseEnter } = props
    let classes = 'twc-autocomplete-item'
    if (selected) classes += ' twc-is-selected'
    return <div className={classes} onClick={onClick} onMouseEnter={onMouseEnter}>
        <img src={item.image} />
        <span className='twc-autocomplete-name'>{item.name}</span>
        <span className='twc-autocomplete-sn'> @{item.screen_name}</span>
    </div>
}


class AutocompleteList extends React.Component {

    constructor(props) {
        super(props)
        this.renderItem = this.renderItem.bind(this)
    }

    renderItem(item, index) {
        return <AutocompleteItem
            onClick={this.onClick.bind(this, item, index)}
            item={item}
            selected={index === this.props.autocomplete.selectedIndex}
            ref={index}
            onMouseEnter={this.onMouseEnter.bind(this, item, index)}
            />
    }

    onClick(item, index, event) {
        event.stopPropagation()
        event.preventDefault()
        this.props.selectAutocompleteItem({
            item: item,
            replyToId: this.props.replyingTo
        })
    }
    onMouseEnter(item, index) {
        this.selectingWithMouse = index
        this.props.updateAutocompleteIndex({ index })
    }

    // Ensure selected item in the list is visible
    scrollItemIntoViewIfNeeded(prevProps) {
        const { selectingWithMouse } = this
        this.selectingWithMouse = null
        if (this.props.autocomplete.selectedIndex !== prevProps.autocomplete.selectedIndex) {
            if (selectingWithMouse === this.props.autocomplete.selectedIndex) {
                // Don't auto-scroll if user is mousing over list.
                // TODO: Less hacky solution
                return
            }

            const selectedItem = this.refs[this.props.autocomplete.selectedIndex],
                element = selectedItem && ReactDOM.findDOMNode(selectedItem)
            if (element)
                element.scrollIntoViewIfNeeded() 

        }
    }

    componentDidUpdate(prevProps) {
        this.scrollItemIntoViewIfNeeded(prevProps)
    }


    render(){
        const { autocomplete, visible } = this.props,
            selected = autocomplete.filtered[autocomplete.selectedIndex],
            displayClass = visible ? 'twc-is-visible' : 'twc-is-hidden',
            wrapperClasses = 'twc-autocomplete-wrapper ' + displayClass

        return (<div className={wrapperClasses}>
            <div className='twc-autocomplete-list'>
                {
                    autocomplete.filtered.slice(0,50).map(
                        this.renderItem
                    )
                }
            </div>
        </div>)
    }


}

export default AutocompleteList