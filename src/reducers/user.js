import { createSelector } from 'reselect'
// import { combineReducers } from 'redux'
import _ from 'underscore'
import { RECEIVE_AUTHENTICATED_USER } from '../actions'


const initialState = {
    authenticated: false
}
export default function(state=initialState, action) {
    switch (action.type) {
        case RECEIVE_AUTHENTICATED_USER:
            const { user } = action
            if (user) {
                return {
                    authenticated: true,
                    ...user
                }
            }
            else {
                return {
                    authenticated: false
                }
            }
        default:
            return state
    }
}

export const isAuthenticated = state => state.user.authenticated