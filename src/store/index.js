import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import rootReducer from '../reducers'
import createLogger from 'redux-logger'
import rootSaga from '../sagas'
export default function configureStore(initialState) {
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(sagaMiddleware)
        // applyMiddleware(sagaMiddleware, createLogger())
    )
    
    sagaMiddleware.run(rootSaga)

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        // https://gist.github.com/hoschi/6538249ad079116840825e20c48f1690
        // TODO: Do the same for sagas
        module.hot.accept('../reducers', () => {
            store.replaceReducer(require('../reducers'))
        })
    }
    store.close = () => store.dispatch(END)
    return store
}