import "babel-polyfill"
import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Root from './containers/Root'
import configureStore from './store'

import 'assets/styles/main.styl'
import 'assets/styles/Draft.css' // Draft-js default styles
// TODO: Import font-styles inline (see below) to get around
// CSP restrictions
import 'assets/styles/twc-icons.css'
// const urlRoot = chrome.runtime.getURL('font/')
// const fontStyle = `
// @font-face {
//   font-family: 'twc-icons';
//   src: url('${urlRoot}twc-icons.eot?15199687');
//   src: url('${urlRoot}font/twc-icons.eot?15199687#iefix') format('embedded-opentype'),
//        url('${urlRoot}twc-icons.woff2?15199687') format('woff2'),
//        url('${urlRoot}twc-icons.woff?15199687') format('woff'),
//        url('${urlRoot}twc-icons.ttf?15199687') format('truetype'),
//        url('${urlRoot}twc-icons.svg?15199687#twc-icons') format('svg');
//   font-weight: normal;
//   font-style: normal;
// }`
// let fs = document.createElement('style')
// fs.innerHTML = fontStyle
// $(document).ready(function(){
//     document.body.appendChild(fs)
// })

const store = configureStore({})

$(document).ready(function(){

    let appRoot = document.getElementById('twc-app-root')
    if (appRoot) { 
        // console.log('Removing old app root')
        appRoot.remove()
    }
    appRoot = document.createElement('div')
    appRoot.id = 'twc-app-root'
    document.body.appendChild(appRoot)

    ReactDOM.render(<Root store={store} />, appRoot)

})