import React from 'react'

import jwtDecode from 'jwt-decode'
import AccountsTree from './AccountsTree'
import Loading from './Loading'
import Error from './Error'
import { View } from '@instructure/ui-view'
import { LtiTokenRetriever, LaunchOAuth, LtiApplyTheme } from '@oxctl/ui-lti'


const settings = {
  'https://localhost:3000': {
    'proxyServer': process.env.REACT_APP_PROXY_URL
  },
  'https://master.canvas-subaccounts.pages.dev': {
    'proxyServer': 'https://proxy-dev.canvas.ox.ac.uk'
  },
  'https://canvas-subaccounts.canvas.ox.ac.uk': {
    'proxyServer': 'https://proxy.canvas.ox.ac.uk'
  }
}

class App extends React.Component {
  state = {
    tryLoading: true,
    comInstructureBrandConfigJsonUrl: null,
    accountId: null,
    accountName: null,
    canvasUrl: null,
    needsToken: false,
    loading: true,
    error: null,
    canvasUserPrefersHighContrast: false
  }

  constructor(props, context) {
    super(props, context)
    this.servers = settings[window.location.origin]
  }

  updateToken = (token) => {
    const jwt = jwtDecode(token)
    this.setState({
      comInstructureBrandConfigJsonUrl: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].com_instructure_brand_config_json_url,
      canvasUserPrefersHighContrast: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_user_prefers_high_contrast === "true",
      accountId: parseInt(jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_id),
      accountName: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_name,
      canvasUrl: jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_api_base_url,
      proxyUrl: this.servers.proxyServer,
      token: token,
      loading: false
    })
  }

  render() {
    return (
      <LtiTokenRetriever handleJwt={this.updateToken}>
        <LtiApplyTheme url={this.state.comInstructureBrandConfigJsonUrl} highContrast={this.state.canvasUserPrefersHighContrast}>
          <View padding="small" as="div">
            <Error message={this.state.error}>
              {(this.state.loading) ? <Loading/> : this.renderContent()}
            </Error>
          </View>
        </LtiApplyTheme>
      </LtiTokenRetriever>
    )
  }

  renderContent() {
    return <LaunchOAuth promptLogin={this.state.needsToken}
                        accessToken={this.state.token}
                        server={{proxyServer: this.state.proxyUrl}}
                        promptUserLogin={() => this.setState({ needsToken: false })}>
      <AccountsTree token={this.state.token} url={this.state.proxyUrl} accountId={this.state.accountId}
                    accountName={this.state.accountName} canvasUrl={this.state.canvasUrl}
                    handle403={this.handle403}
                    handleError={this.handleError}
      />
    </LaunchOAuth>
  }

  handleError = (reason) => {
    if (reason) {
      this.setState({ error: (reason.message) ? reason.message : reason })
    }
  }

  handle403 = () => {
    this.setState({ needsToken: true })
  }
}

export default App
