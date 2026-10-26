import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DatasetProvider } from './lib/DatasetContext'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DatasetProvider>
        <App />
      </DatasetProvider>
    </BrowserRouter>
  </StrictMode>,
)
