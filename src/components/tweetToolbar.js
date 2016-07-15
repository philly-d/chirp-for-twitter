import React from 'react'
import classNames from 'classnames'
import { getTweetLength } from 'twitter-text'

function getCharCount(text, hasScreenshots) {
    if (hasScreenshots) {
        text = text.trim() + ' http://pic.twitter.com'
    }
    return getTweetLength(text)
}

const TweetToolbar = (props) => {
    const {
            editorState, screenshot, isSendingTweet, authenticated,
            login, sendTweet, onClick
        } = props,
        text = editorState ? editorState.getCurrentContent().getPlainText() : '',
        charCount = getCharCount(text, screenshot),
        remainingChars = 140 - charCount,
        validTweetLength = charCount > 0 && charCount <= 140,
        buttonDisabled = isSendingTweet || (authenticated && !validTweetLength),
        btnText = authenticated ? 'Tweet' : 'Login to Tweet',
        onBtnClick = buttonDisabled ? null : onClick

    let toolboxClasses = 'twc-tweet-toolbar',
        charCountClasses = 'twc-charcount',
        btnClasses = 'twc-btn twc-tweet-btn'
    if (isSendingTweet) toolboxClasses += ' twc-is-loading'
    if (remainingChars < 15) charCountClasses += ' danger'
    if (buttonDisabled) btnClasses += ' twc-is-disabled'
    
    return (<div className={toolboxClasses}>
        <div className='twc-toolbar-left'>
            <div className='twc-loading-spinner' />
            <span className={charCountClasses}>{ remainingChars }</span>
        </div>
        <div className={btnClasses} onClick={onBtnClick}>{ btnText }</div>
    </div>)
}


export default TweetToolbar

