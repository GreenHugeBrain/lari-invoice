import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../styles.css'
import Saved from '../pages/Saved.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Saved />
  </StrictMode>,
)
