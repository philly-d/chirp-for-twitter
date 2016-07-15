import { SHOT_BLACKLIST_STORAGE_KEY } from '../constants'
import { disableScreenshotter } from '../actions'
import { put } from 'redux-saga/effects'
import { getStorage } from './storage'

const ALLOWED_DOMAINS = ["youtube.com","theverge.com","nytimes.com","medium.com","imgur.com","wikipedia.org","reddit.com","craigslist.org","amazon.com","tumblr.com","instagram.com","linkedin.com","puu.sh","quora.com","soundcloud.com","vimeo.com","apple.com","github.io","producthunt.com","vice.com","washingtonpost.com","theguardian.com","ycombinator.com","kickstarter.com","stackoverflow.com","wordpress.com","yahoo.com","vox.com","bloomberg.com","venturebeat.com","grantland.com","dribbble.com","blogspot.com","fastcompany.com","time.com","airbnb.com","ted.com","streeteasy.com","yelp.com","dropbox.com","fastcodesign.com","vine.co","recode.net","thrillist.com","etsy.com","hbr.org","fortune.com","entrepreneur.com","flickr.com","fivethirtyeight.com","brainpickings.org","indiegogo.com","seamless.com","eventbrite.com","redfin.com","bostonglobe.com","crunchbase.com","xkcd.com","microsoft.com","jcrew.com","pando.com","tmz.com","gigaom.com","goodreads.com","farnamstreetblog.com","growthhackers.com","a16z.com","collegehumor.com","lindanieuws.nl","gfycat.com","squarespace.com","wikiwand.com","instapaper.com","gv.com","getpocket.com","giphy.com","mozilla.org","polygon.com","onedio.com","digg.com","upworthy.com","chrome.com","css-tricks.com","food52.com","helpscout.net","groupon.com","nasa.gov","hubspot.com","zillow.com","timeout.com","archive.org","signalvnoise.com","scientificamerican.com","useronboard.com","coursera.org","dailymotion.com","variety.com","playbuzz.com","shopify.com","pinimg.com","billboard.com","wikimedia.org","fiverr.com","themuse.com","jacobinmag.com","songkick.com","stratechery.com","khanacademy.org","biblegateway.com","android.com","wordpress.org","chronicle.com","thoughtbot.com","anthropologie.com","aplus.com","psychologytoday.com","tvline.com","boston.com","foursquare.com","racked.com","fancy.com","quip.com","jquery.com","bonobos.com","8tracks.com","thechive.com","readability.com","wired.com","buzzfeed.com","techcrunch.com","businessinsider.com","theatlantic.com","huffingtonpost.com","mashable.com","newyorker.com","wsj.com","cnn.com","9gag.com","gawker.com","forbes.com","gizmodo.com","vulture.com","npr.org","nymag.com","thenextweb.com","qz.com","gothamist.com","slate.com","deadspin.com","rollingstone.com","bbc.com","lifehacker.com","theonion.com","elitedaily.com","meetup.com","paulgraham.com","clickhole.com","economist.com","co.nz","avclub.com","adweek.com","engadget.com","jezebel.com","usatoday.com","eater.com","imdb.com","thedailybeast.com","politico.com","ebay.com","complex.com","nypost.com","latimes.com","bleacherreport.com","vanityfair.com","kotaku.com","thoughtcatalog.com","mic.com","brobible.com","pitchfork.com","avc.com","newrepublic.com","iflscience.com","nydailynews.com","reuters.com","seriouseats.com","refinery29.com","io9.com","gq.com"]

function disable() {
    return put(disableScreenshotter())
}

// Disable highlight button on blacklisted domains + most https sites
export default function* checkBlacklist() {
    const domain = window.location.host.split('.').slice(-2).join('.')
    if (window.location.protocol === 'https:') {
        // Don't show highlighter button on most https domains
        if (!ALLOWED_DOMAINS.includes(domain)) {
            yield disable()
            return
        }
    }
    
    try {
        const stored = yield getStorage(SHOT_BLACKLIST_STORAGE_KEY)
        const blacklist = stored[SHOT_BLACKLIST_STORAGE_KEY]
        if (blacklist && blacklist.includes(domain)) {
            yield disable()
        }
    } catch (err) {
        console.log('Failed to load blacklist', err)
    }

}