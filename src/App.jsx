import React, { useCallback, useState } from 'react'

import jwtDecode from 'jwt-decode'
import AccountsTree from './AccountsTree.jsx'
import Loading from './Loading.jsx'
import Error from './Error.jsx'

import { View } from '@instructure/ui-view'
import { LtiTokenRetriever, LaunchOAuth, LtiPageSettings } from '@oxctl/ui-lti'


const App = () => {
  const [state, setState] = useState({
    tryLoading: true,
    accountId: null,
    accountName: null,
    canvasUrl: null,
    needsToken: false,
    loading: true,
    error: null
  })

  const updateToken = useCallback((token, toolSupportServer) => {
    const jwt = jwtDecode(token)
    setState(current => ({ ...current,
      accountId: parseInt(jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_id),
      accountName: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_name,
      canvasUrl: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_api_base_url,
      toolSupportServer: toolSupportServer,
      token: token,
      loading: false
    }))
  }, [])

  const handleError = useCallback((reason) => {
    if (reason) setState(current => ({ ...current, error: reason.message ? reason.message : reason }))
  }, [])

  const handle403 = useCallback(() => {
    setState(current => ({ ...current, needsToken: true }))
  }, [])

  const renderContent = () => <LaunchOAuth promptLogin={state.needsToken}
                        accessToken={state.token}
                        server={{proxyServer: state.toolSupportServer}}
                        promptUserLogin={() => setState(current => ({ ...current, needsToken: false }))}>
      <AccountsTree token={state.token} url={state.toolSupportServer} accountId={state.accountId}
                    accountName={state.accountName} canvasUrl={state.canvasUrl}
                    handle403={handle403}
                    handleError={handleError}
      />
    </LaunchOAuth>

  return (
      <LtiTokenRetriever handleJwt={updateToken}>
        <LtiPageSettings>
          <View padding="small" as="div">
            <Error message={state.error}>
              {(state.loading) ? <Loading/> : renderContent()}
            </Error>
          </View>
        </LtiPageSettings>
      </LtiTokenRetriever>
    )
}

export default App
