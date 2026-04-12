import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./App.css"
import ContextProvider from './contexts/ContextProvider.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*Add Context provider at the root level*/}
    
    <ContextProvider>
    <App />
    </ContextProvider>
  </StrictMode>,
)