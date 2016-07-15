import TwitterAPI from './requestor'

function reflect (promise) {
    return promise.then(function(result){
        return result
    }, function(e){
        return null
    })
}

function lookupFriends (list) {
    return TwitterAPI.lookupUsers({
        user_id: list.join(',')
    })
}

function fetchFriends (userId) {
    return TwitterAPI.getFriends({
        user_id: userId,
        count: 5000
    })
}
function fetchFollowers (userId) {
    return TwitterAPI.getFollowers({
        user_id: userId,
        count: 5000
    })
}

// Get first 5000 friends and look them
// up by id in batches of 100.
// TODO: Stagger these requests, Phil. Jeez.
// TODO: Handle request failures + rate-limiting.
function getAllFriends (userId) {
    return fetchFriends(userId)
    .then((data) => {
        let { ids } = data,
            sublists = []
        while (ids.length) {
            sublists.push(ids.splice(0, 100))
        }
        return Promise.all(
            sublists.map(arr => {
                return reflect(lookupFriends(arr))
            })
        )
    }, (err) => {
        return []
    })
    .then((results) => {
        let list = []
        results.forEach( (sublist) => {
            if (sublist instanceof Array) {
                sublist.forEach( (i) => list.push(i) )
            }
        })
        return list
    })
}

function getFollowersMap (userId) {
    let followersMap = {}
    return fetchFollowers(userId)
    .then((data) => {
        if (data && data.ids) {
            data.ids.forEach( id => followersMap[id] = id )
        }
        return followersMap
    }, (err) => {
        return followersMap
    })
}

// Fetch first 5000 accounts the user follows
// and sort by mutual relationships. This is
// a quick hacky friends solution since 
// users could follow 5000+ accounts, but
// especially because those that have many
// followers will not get an optimal sort
// order because only their first 5000 followers
// are sorted against.
// TODO: Get a proper server set up and handle
// a find-friends task.
function getFriendsList (userId) {
    return Promise.all([
        getAllFriends(userId),
        getFollowersMap(userId)
    ]).then((results) => {
        let friends = results[0],
            followers = results[1],
            sorted = []

        friends.forEach((f) => {
            const friend = {
                id: f.id_str,
                name: f.name,
                image: f.profile_image_url,
                screen_name: f.screen_name
            }
            if (followers[friend.id]) {
                sorted.unshift(friend)
            } else {
                sorted.push(friend)
            }
        })

        return sorted
    })
}



export default getFriendsList
