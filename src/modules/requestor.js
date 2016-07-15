import querystring from 'querystring'
import $ from 'jquery'
const SIGNING_URL = 'https://chrometweets.herokuapp.com/sign/request'

const crlf = "\r\n"
const boundaryBorder = '--------'
// Create random boundary for multipart form upload.
// Via https://gist.github.com/fillano/2485344
function createBoundary () {
    let tmp = Math.random()
    tmp = Math.abs(tmp * new Date().getTime())
    return boundaryBorder + tmp + boundaryBorder
}

function encodeQueryString (data) {
    return querystring.stringify(data)
       .replace(/\!/g, "%21")
       .replace(/\'/g, "%27")
       .replace(/\(/g, "%28")
       .replace(/\)/g, "%29")
       .replace(/\*/g, "%2A")
}

function AuthError () {
    let err = new Error()
    err.status = 401
    err.message = 'Could not authenticate you.'
    return err
}

class TwitterAPI {
    constructor() {
        this._appUrl = SIGNING_URL
        this._auth = null
    }

    setAuth(auth) { this._auth = auth }
    getAuth() { return this._auth }

    // Use our server to sign the API request with the application's
    // client + secret keys. Then make the signed request to Twitter's
    // API.
    // TODO: Our server should make requests on behalf of the user.
    makeRequest({ url, method, params, auth, encodedData, headers }) {
        auth = auth || this.getAuth()
        if (!auth) {
            return Promise.reject(AuthError())
        }
        let payload = {
            auth: auth,
            params: params,
            url: url,
            method: method
        },
            finalHeaders = headers || {},
            finalData = encodedData || params
        return $.ajax({
            url: SIGNING_URL,
            type: "POST",
            data: JSON.stringify(payload),
            contentType:"application/json",
            dataType: 'json'
        })
        .then((res) => {
            finalHeaders.Authorization = res.header

            if (typeof finalData === 'object' && method === 'POST') {
                finalData = encodeQueryString(finalData)
            }
            
            return $.ajax({
                url: url,
                method: method,
                data: finalData,
                headers: finalHeaders
            })
            .then((data) => {
                return data
            },
            (err) => {
                const errors = err.responseJSON && err.responseJSON.errors
                if (errors) {
                    // Get error message from Twitter response
                    err.message = errors[0].message
                }
                return err
            })
        })
    }

    getFriends(params) {
        return this.makeRequest({
            url: 'https://api.twitter.com/1.1/friends/ids.json',
            method: 'GET',
            params: params
        })
    }

    getFollowers(params) {
        return this.makeRequest({
            url: 'https://api.twitter.com/1.1/followers/ids.json',
            method: 'GET',
            params: params
        })
    }

    lookupUsers(params){
        return this.makeRequest({
            url: 'https://api.twitter.com/1.1/users/lookup.json',
            method: 'POST',
            params: params
        })
    }
    
    uploadImage(data) {
        const fileName = 'screenshort.png'
        const dataStr = data.substring('data:image/png;base64,'.length)
        const boundary = createBoundary()
        const photoName = fileName
        const separator = '--' + boundary
        const footer = crlf + separator + '--' + crlf
        const fileHeader = 'Content-Disposition: form-data; name="media_data"; filename="' + photoName + '"'
        const head = separator + crlf
                + fileHeader + crlf
                + 'Content-Type: application/octet-stream' + crlf
                + 'Content-Transfer-Encoding: base64' + crlf
                + crlf
        const body = head + dataStr + footer

        return this.makeRequest({
            url: 'https://upload.twitter.com/1.1/media/upload.json',
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Transfer-Encoding': 'base64'
            },
            encodedData: body
        })
    }

    sendTweet(tweet) {
        return this.makeRequest({
            url: 'https://api.twitter.com/1.1/statuses/update.json',
            method: 'POST',
            params: tweet
        })
    }

}


export default new TwitterAPI()

