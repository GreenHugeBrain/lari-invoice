import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../styles.css'
import Settings from '../pages/Settings.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Settings />
  </StrictMode>,
)
