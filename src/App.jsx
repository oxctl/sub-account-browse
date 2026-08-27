import React, { useCallback, useState } from 'react'

import jwtDecode from 'jwt-decode'
import AccountsTree from './AccountsTree.jsx'
import Loading from './Loading.jsx'
import Error from './Error.jsx'

import { View } from '@instructure/ui-view'
import { LtiTokenRetriever, LaunchOAuth, LtiApplyTheme } from '@oxctl/ui-lti'


const settings = {
  'https://localhost:3000': {
    'proxyServer': import.meta.env.VITE_PROXY_URL
  },
  'https://master.canvas-subaccounts.pages.dev': {
    'proxyServer': 'https://tools-dev.canvas.ox.ac.uk'
  },
  'https://canvas-subaccounts.canvas.ox.ac.uk': {
    'proxyServer': 'https://tools.canvas.ox.ac.uk'
  }
}

const App = () => {
  const [state, setState] = useState({
    tryLoading: true,
    comInstructureBrandConfigJsonUrl: null,
    accountId: null,
    accountName: null,
    canvasUrl: null,
    needsToken: false,
    loading: true,
    error: null,
    canvasUserPrefersHighContrast: false
  })
  const servers = settings[window.location.origin]

  const updateToken = useCallback((token) => {
    const jwt = jwtDecode(token)
    setState(current => ({ ...current,
      comInstructureBrandConfigJsonUrl: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].com_instructure_brand_config_json_url,
      canvasUserPrefersHighContrast: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_user_prefers_high_contrast === "true",
      accountId: parseInt(jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_id),
      accountName: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_name,
      canvasUrl: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_api_base_url,
      proxyUrl: servers.proxyServer,
      token: token,
      loading: false
    }))
  }, [servers.proxyServer])

  const handleError = useCallback((reason) => {
    if (reason) setState(current => ({ ...current, error: reason.message ? reason.message : reason }))
  }, [])

  const handle403 = useCallback(() => {
    setState(current => ({ ...current, needsToken: true }))
  }, [])

  const renderContent = () => <LaunchOAuth promptLogin={state.needsToken}
                        accessToken={state.token}
                        server={{proxyServer: state.proxyUrl}}
                        promptUserLogin={() => setState(current => ({ ...current, needsToken: false }))}>
      <AccountsTree token={state.token} url={state.proxyUrl} accountId={state.accountId}
                    accountName={state.accountName} canvasUrl={state.canvasUrl}
                    handle403={handle403}
                    handleError={handleError}
      />
    </LaunchOAuth>

  return (
      <LtiTokenRetriever handleJwt={updateToken}>
        <LtiApplyTheme url={state.comInstructureBrandConfigJsonUrl} highContrast={state.canvasUserPrefersHighContrast}>
          <View padding="small" as="div">
            <Error message={state.error}>
              {(state.loading) ? <Loading/> : renderContent()}
            </Error>
          </View>
        </LtiApplyTheme>
      </LtiTokenRetriever>
    )
}

export default App
