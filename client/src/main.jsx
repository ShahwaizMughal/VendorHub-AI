import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { store } from './store'
import AppInitializer from './app/AppInitializer.jsx'

// axiosBaseQuery.js and lib/axios.js both read the store off `window` to
// attach the current access token / handle 401-triggered refresh+retry,
// rather than importing the store module directly (which would create a
// circular dependency between the store and the axios layer it configures).
window.__REDUX_STORE__ = store;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <App />
        </AppInitializer>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
