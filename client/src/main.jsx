import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from './context/AppContext.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if(! PUBLISHABLE_KEY){
  throw new Error("Add key Clerk Publishable key to the .env file")
}
const localization = {
  formFieldInput__emailAddress_not_found: "Account not found. Please sign up first.",
  formFieldInput__identifier_not_found: "Account not found. Please sign up first.",
  unstable__errors: {
    form_identifier_not_found: "Account not found. Please sign up first.",
    not_found: "Account not found. Please sign up first.",
    external_account_not_found: "Account not found. Please sign up first."
  },
  signIn: {
    start: {
      errors: {
        formIdentifierNotFound: "Account not found. Please sign up first.",
        userNotFound: "Account not found. Please sign up first.",
        externalAccountNotFound: "Account not found. Please sign up first."
      }
    }
  }
};

createRoot(document.getElementById('root')).render(
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/" 
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        localization={localization}
        appearance={{
          elements: {
            footerActionLink: "text-blue-600 font-semibold underline hover:text-blue-800"
          }
        }}
      >
        <BrowserRouter>
          <AppProvider>
          <App />
          </AppProvider>
        </BrowserRouter>
      </ClerkProvider>,
)
