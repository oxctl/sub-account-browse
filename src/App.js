/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from 'react'

import { theme } from '@instructure/canvas-theme'
import jwtDecode from 'jwt-decode'
import LtiApplyTheme from './LtiApplyTheme'
import AccountsTree from './AccountsTree'
import { View } from '@instructure/ui-view'
import { Loading } from './Loading'
import Error from './Error/Error'
import { LtiTokenRetriever, LaunchOAuth } from '@oxctl/ui-lti'


const settings = {
  'https://localhost:3000': {
    'ltiServer': process.env.REACT_APP_LTI_URL,
    'proxyServer': process.env.REACT_APP_PROXY_URL,
  },
  'https://master.canvas-subaccounts.pages.dev': {
    'ltiServer': 'https://lti-dev.canvas.ox.ac.uk',
    'proxyServer': 'https://proxy-dev.canvas.ox.ac.uk'
  },
  'https://canvas-subaccounts.canvas.ox.ac.uk': {
    'ltiServer': 'https://lti.canvas.ox.ac.uk',
    'proxyServer': 'https://proxy.canvas.ox.ac.uk'
  }
}

theme.use()

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
      <LtiTokenRetriever ltiServer={this.servers.ltiServer} handleJwt={this.updateToken}>
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
