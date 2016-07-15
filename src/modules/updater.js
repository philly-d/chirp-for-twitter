function onUpdate (details) {
    console.log("Update available!", details)
    chrome.runtime.reload()
}

function listenForUpdates () {
    chrome.alarms.onAlarm.addListener(() => {
        chrome.runtime.requestUpdateCheck((status, details) => {
            if (status.toString() === 'update_available')
                onUpdate(details)
        })
    })
    chrome.alarms.create('update_check', {
        periodInMinutes: 5.0,
        delayInMinutes: 1.0
    })
    chrome.runtime.onUpdateAvailable.addListener(onUpdate)
}

export default listenForUpdates