import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './client/App.tsx'
import { HeroUIProvider } from '@heroui/react'

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <HeroUIProvider>
      <App  />
    </HeroUIProvider>
  </StrictMode>,


)
