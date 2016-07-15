import React from 'react'
import Tweet from './tweet.js'

const TweetThread = React.createClass({

    onTweetClick(tweet, forceFocus) {
        this.props.setActiveTweet({
            tweet: tweet,
            threadId: this.props.thread.id,
            forceFocus
        })
    },

    render() {
        const { thread } = this.props
        let { tweets, activeTweet } = thread
        return (<div>
            {
                tweets.map((t) => {
                    return <Tweet tweet={t}
                        active={t.id === activeTweet}
                        key={t.id}
                        onClick={this.onTweetClick}
                    />
                })
            }
        </div>)
    }
})

export default TweetThread
