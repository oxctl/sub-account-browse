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
import LaunchOAuth from './LaunchOAuth'
import AccountsTree from './AccountsTree'
import { View } from '@instructure/ui-view'
import { Loading } from './Loading'
import Error from './Error/Error'
import console from '@instructure/console'


const settings = {
  'https://localhost:3000': {
    // 'ltiServer': 'https://localhost:28443',
    'ltiServer': 'https://lti.canvas.ox.ac.uk',
    // 'proxyServer': 'https://localhost:18443'
    'proxyServer': 'https://proxy.canvas.ox.ac.uk'
  },
  'https://oxctl-subaccounts.s3-eu-west-1.amazonaws.com': {
    'ltiServer': 'https://lti.canvas.ox.ac.uk',
    'proxyServer': 'https://proxy.canvas.ox.ac.uk'
  },
  'https://oxctl-canvas-subaccounts-dev.s3-eu-west-1.amazonaws.com': {
    'ltiServer': 'https://lti-dev.canvas.ox.ac.uk',
    'proxyServer': 'https://proxy-dev.canvas.ox.ac.uk'
  },
  'https://oxctl-canvas-subaccounts-prod.s3-eu-west-1.amazonaws.com': {
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
    error: null
  }

  token = null

  componentDidMount() {
    // TODO handling not defined.
    const servers = settings[window.location.origin]
    if (this.state.tryLoading) {
      // TODO Need to stash this in local storage
      var params = new URLSearchParams(window.location.search)
      var token = params.get('token')
      const formData = new FormData()
      formData.append('key', token)
      // How to pass this across?
      fetch(servers.ltiServer + '/token', {
          method: 'POST',
          body: formData
        }
      ).then(response => {
          if (!response.ok) {
            const token = localStorage.getItem('token')
            if (token) {
              this.updateToken(token, servers)
            }
          } else {
            return response
          }
        }
      ).then(response => response.json()
      ).then(json => {
        this.token = json.token_value
        localStorage.setItem('token', json.token_value)
        this.updateToken(json.token_value, servers)
      }).finally(() => {
        // this.setState({ loading: false })
      })
    }
  }

  updateToken(token, servers) {
    this.jwt = jwtDecode(token)
    this.setState({
      comInstructureBrandConfigJsonUrl: this.jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].com_instructure_brand_config_json_url,
      accountId: parseInt(this.jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_id),
      accountName: this.jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_account_name,
      canvasUrl: this.jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_api_base_url,
      proxyUrl: servers.proxyServer,
      token: token,
      loading: false
    })
  }

  render() {
    console.log(process.env.NODE_ENV)
    return (
      <LtiApplyTheme url={this.state.comInstructureBrandConfigJsonUrl}>
        <View padding="small" as="div">
          <Error message={this.state.error}>
            {(this.state.loading) ? <Loading/> : this.renderContent()}
          </Error>
        </View>
      </LtiApplyTheme>
    )
  }

  renderContent() {
    return <LaunchOAuth needsToken={this.state.needsToken} jwt={this.state.token}
                        url={this.state.proxyUrl + '/tokens/check'}
                        handleLoginDone={() => this.setState({ needsToken: false })}>
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
