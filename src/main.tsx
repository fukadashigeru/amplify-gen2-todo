// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import Root from './Root'  // ← ここをAppからRootに変更
// import App from './App'

Amplify.configure(outputs)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
    {/* <App /> */}
  </React.StrictMode>,
)
