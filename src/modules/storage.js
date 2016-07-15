import ChromePromise from 'chrome-promise'

function get (key) {
    return chrome.promise.storage.local.get(key)
    .then((stored) => {
        if (typeof key === 'string') {
            return stored[key]
        }
        return stored
    })
}
function set (key, val) {
    let toStore = {}
    if (typeof key === 'string')
        toStore[key] = val
    else if (typeof key === 'object')
        toStore = key

    return chrome.promise.storage.local.set(toStore)
}
function remove (key) {
    return chrome.promise.storage.local.remove(key)
}

// Helper functions using chrome.promise to wrap storage handlers
export default {
    get, set, remove
}