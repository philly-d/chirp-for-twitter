import './chromePromise'
import co from 'co'
import { RUNTIME_REQUEST_SUCCESS, RUNTIME_REQUEST_FAILURE } from '../constants'

function captureVisibleTab() {
    return chrome.promise.tabs.captureVisibleTab()
}
// Takes an image and dimensions, returns a cropped data uri
function imageToDataURL(image, x, y, width, height) {
    let canvas = document.createElement('canvas'),
        context = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    context.drawImage(image, x, y, width, height, 0, 0, width, height)
    return canvas.toDataURL()
}
// Take a data uri and crop it to
// the given dimensions
function cropScreenshot(dataUrl, props) {
    return new Promise(function(resolve, reject){
        const { rect, windowDimensions } = props

        let img = new Image()
        img.onload = () => {
            // Get the scale/zoom of the page and update
            // the dimensions to crop.
            const ratio = img.width / windowDimensions.width,
                dims = {
                    left: rect.left * ratio,
                    width: rect.width *ratio,
                    height: rect.height * ratio,
                    top: rect.top * ratio
                },
                // Crop the image
                croppedData = imageToDataURL(
                    img, dims.left, dims.top, dims.width, dims.height
                )
            resolve(croppedData)
        }
        img.onerror = (err) => reject(err)
        img.src = dataUrl
    })
}

// Capture visible tab and crop it.
const TakeScreenshot = co.wrap(function*(props) {
    try {
        const dataUrl = yield captureVisibleTab()
        const croppedUrl = yield cropScreenshot(dataUrl, props)
        return {
            id: props.id,
            dataUrl: croppedUrl
        }
    } catch (error) {
        throw error
    }
    
})


export default TakeScreenshot