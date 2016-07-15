import React from 'react'
import classNames from 'classnames'

const Banner = (props) => {
    const { banner, onClick } = props,
        { visible, message, type, tweet, error } = banner,
        bannerClass = classNames({
            'twc-banner': true,
            'twc-banner-expanded': visible,
            'twc-banner-error': !!error
        })
    let content = message

    if (error && !content) {
        content = error.message || 'Something went wrong! Please try again.'
    }
    else if (tweet) {
        content = (<span>
            Your <a href={tweet.permalink} target='_blank'
                style={{textDecoration:'underline', color: 'white'}}>tweet</a> was posted!
        </span>)
    }
    return (
        <div
            className={bannerClass}
            fixedHeight={35}
            onClick={props.onClick}
            isOpened={visible}>
            { content }
        </div>
    )

}

export default Banner