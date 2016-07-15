import React from 'react'
import TweetEditor from './tweetEditor'
import TweetDraft from '../containers/TweetDraft'
import twitterText from 'twitter-text'

const tweetEntityClass = 'twc-tweet-entity'
const tweetLinkClass = 'twc-tweet-link'
const twParseOptions = {
    usernameIncludeSymbol: true,
    targetBlank: true,
    hashtagClass: tweetEntityClass,
    cashtagClass: tweetEntityClass,
    usernameClass: tweetEntityClass,
    urlClass: tweetLinkClass
}


const Tweet = React.createClass({

    render() {

        let replyTos = [this.props.tweet.user.screen_name]
            .concat(this.props.tweet.mentions).map(function(i){
                return '@' + i
            }).join(' '),
            placeholder = 'Reply to ' + replyTos

        return (<div className='twc-tweet' onClick={this.onClick}>
            <div className='twc-tweet-header'>
                <div className='twc-tweet-avatar'>
                    <img src={this.props.tweet.user.picture} />
                </div>
                <div>
                    <span className='twc-user-name'>
                        {this.props.tweet.user.name}
                    </span>
                    <span className='twc-user-handle'>
                        @{this.props.tweet.user.screen_name}
                    </span>
                </div>
            </div>
            {
                this.renderText()
            }
            <div className='twc-tweet-footer'>
                {
                    this.renderTime()
                }
                <div className='twc-tweet-footer-item twc-tweet-reply-button'
                    onClick={this.onReplyClick}>
                    <i className='twcicn-reply' />
                </div>
            </div>
            {
                this.renderReply()
            }
        </div>)
    },

    isContinuation() {
        return this.props.previous && this.props.previous.user.id === this.props.tweet.user.id
    },
    
    renderText() {
        let { text, entities } = this.props.tweet
        const html = { __html: twitterText.autoLinkWithJSON(text, entities, twParseOptions) }
        return <div className='twc-tweet-text' dangerouslySetInnerHTML={html} />
    },

    getLink() {
        const { tweet } = this.props
        if (tweet.permalink) {
            return tweet.permalink
        } else {
            return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`
        }
    },

    renderTime() {
        let time = new Date(this.props.tweet.created_at),
            hours = time.getHours(),
            min = time.getMinutes(),
            period = hours >= 12 ? 'pm' : 'am'
        min = min < 10 ? ('0' + min) : min
        hours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours)

        return (<a href={this.getLink()} target='_blank'
            className='twc-tweet-footer-item twc-tweet-time twc-tweet-footer-link'>
            {hours + ':' + min + period}
        </a>)
    },

    renderReply() {
        if (this.props.active) {
            return <TweetDraft replyTo={this.props.tweet}/>
        }
    },

    onReplyClick(e) {
        e.stopPropagation()
        this.props.onClick(this.props.tweet, true)
    },

    onClick(e) {
        if (e.target.closest('a')) // Ignore if user is opening a link
            return
        this.props.onClick(this.props.tweet)
    }
})

export default Tweet
