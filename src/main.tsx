import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Note: StrictMode disabled while we debug Mapbox rendering. StrictMode
// runs effects twice in dev to expose race conditions, but mapbox-gl's
// canvas doesn't fully recover from the rapid mount→unmount→mount.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
