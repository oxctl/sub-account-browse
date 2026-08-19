import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import * as Sentry from "@sentry/react";

// These values are supplied by the Vite/Cloudflare configuration in wrangler.toml.
// VITE_SENTRY_DSN is a Cloudflare secret and is intentionally absent from the
// checked-in configuration for local development.
const dsn = import.meta.env.VITE_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENV,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
  })
}


ReactDOM.render(<App />, document.getElementById('app'))
