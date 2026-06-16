import React from 'react'

import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view'
import { Tooltip } from '@instructure/ui-tooltip'
import { Spinner } from '@instructure/ui-spinner'

import * as utils from './utils.js'

import { parseLinkHeader } from '@web3-storage/parse-link-header'


class Account extends React.Component {

  state = {
    isLoading: false,
    isLoaded: false,
    error: null,
    courseCount: null
  }

  resolveCourseCount = async (response, links, firstPageItems) => {
    if (!(links && links.next && links.next.url)) {
      return firstPageItems
    }

    let total = firstPageItems
    let url = links.next.url
    while (url) {
      const nextResponse = await utils.fetchWithAuth(url, this.props.token).then(utils.rejectFailures)
      const nextItems = await nextResponse.json().then(json => json.length)
      total += nextItems
      const nextLinks = parseLinkHeader(nextResponse.headers.get('Link'))
      url = (nextLinks && nextLinks.next) ? nextLinks.next.url : null
    }

    return total
  }

  loadCourses = async () => {
    this.setState({ isLoading: true })
    try {
      const response = await utils.fetchWithAuth(this.props.url + '/api/v1/accounts/' + this.props.account.id + '/courses?per_page=100', this.props.token)
        .then(utils.rejectFailures)
      const links = parseLinkHeader(response.headers.get('Link'))
      const items = await response.json().then(json => json.length)
      const courseCount = await this.resolveCourseCount(response, links, items)
      this.setState({ courseCount, isLoaded: true })
    } finally {
      this.setState({ isLoading: false })
    }
  }

  shouldLoad = () => !this.state.isLoaded && !this.state.isLoading

  showInfo = () => {
    if (this.shouldLoad()) {
      // We don't want to fail the whole tool here as it's not core functionality and it's useful to still show the
      // current state.
      this.loadCourses().catch(() => this.setState({ error: 'Failed to load' }))
    }
  }

  renderTip = () => {
    if (this.state.error) {
      return this.state.error
    } else {
      if (this.state.isLoading) {
        return <Spinner size="x-small" renderTitle="Loading courses"/>
      } else if (this.state.isLoaded) {
        if (this.state.courseCount !== null) {
          return this.state.courseCount + ' courses'
        }
      } else {
        return 'Unknown state'
      }
    }
  }

  // We have to use the alert colour as the warning doesn't have a good accessibility value
  render() {
    const account = this.props.account
    return (<React.Fragment>
      {this.renderIcon(account)}
      <View position="relative"
        background={this.props.account.id === this.props.focused ? 'alert' : null}
      >
        <Tooltip
          renderTip={this.renderTip}
          placement="end"
          on={['hover', 'focus']}
          onShowContent={this.showInfo}
        >
        <Link href={this.props.canvasUrl + '/accounts/' + account.id} target="_top" color={this.props.account.id === this.props.focused ? 'link-inverse' : null}>
          {account.name}
        </Link>
        </Tooltip>
      </View>
      {(this.props.includeSisId && account.sis_id) ?
        <Text size="small" color="secondary">({account.sis_id})</Text> : null}
    </React.Fragment>)
  }

  renderIcon(account) {
    const isOpen = this.props.isOpen
    return <IconButton withBackground={false} withBorder={false}
                       screenReaderLabel={(isOpen) ? `Collapse ${account.name} sub-accounts` : `Expand ${account.name} sub-accounts`} margin="x-small"
                       onClick={() => this.props.handleIconClick(account.id)}>
      {(isOpen) ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
    </IconButton>
  }
}

export default Account
