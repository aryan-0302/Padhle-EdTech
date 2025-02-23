import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import rootReducer from './reducer/index.js'
import { configureStore } from '@reduxjs/toolkit'
import { Toaster } from 'react-hot-toast'

// Redux toolkit is the solution of prop drilling problem,by creating a centralised store where all states are stored and to be fetched.
const store=configureStore({
  reducer:rootReducer,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <App />
    <Toaster></Toaster>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)

// 1.useDispatch: dispatche(increment())=dispatch increment action to the redux store where reducers handle the state update.The updated state is provided to the React component(s) connected to the Redux store.Specifically used in Redux-based state management.
// 2.useSelector: It allows components to read state directly from the Redux store.It accesses the counter slice of the state and retrieves the value property. Access specific state from a Redux store.
// 3.useContext(): access values from a react context.