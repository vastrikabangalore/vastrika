import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/jost/index.css'
import './styles.css'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { FeedbackProvider } from './components/ui.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
