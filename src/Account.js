import React from 'react'
import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view'
import { IconInfoLine } from '@instructure/ui-icons'
import { Tooltip } from '@instructure/ui-tooltip'
import parseLinkHeader from 'parse-link-header'


class Account extends React.Component {

  state = {
    isLoading: false,
    isLoaded: false,
    error: null,
    courseCount: null
  }

  rejectFailures = (response) => {
    if (!response.ok) {
      return Promise.reject('Response is not ok')
    }
    return response
  }

  fetchWithAuth = (url) => {
    return fetch(url, {
      headers: new Headers({
        'Authorization': 'Bearer ' + this.props.token
      })
    })
  }

  loadCourses = async () => {
    this.setState({ isLoading: true })
    const response = await this.fetchWithAuth(this.props.url + '/api/v1/accounts/' + this.props.account.id + '/courses?per_page=1')
      .then(this.rejectFailures)
      .finally(() => this.setState({ isLoading: false }))
    const links = parseLinkHeader(response.headers.get('Link'))
    const items = await response.json().then(json => json.length)
    if (links && links.last) {
      const total = links.last.page
      this.setState({ courseCount: (total > 1)?total:items })
    }
    this.setState({isLoaded: true})
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
        return 'Loading...'
      } else if (this.state.isLoaded) {
        if (this.state.courseCount !== null) {
          return this.state.courseCount + ' courses'
        }
      } else {
        return 'Unknown state'
      }
    }
  }

  render() {
    const account = this.props.account
    return (<React.Fragment>
      {this.renderIcon(account)}
      <View position="relative" background={this.props.account.id === this.props.focused ? 'secondary' : null}>
        <Link href={this.props.canvasUrl + '/accounts/' + account.id} target="_top">
          {account.name}
        </Link>
      </View>
      {(this.props.includeSisId && account.sis_id) ?
        <Text size="small" color="secondary">({account.sis_id})</Text> : null}
      <Tooltip
        renderTip={this.renderTip}
        placement="end"
        on={['click', 'hover', 'focus']}
        onShowContent={this.showInfo}
      >
        <IconButton
          renderIcon={IconInfoLine}
          color="secondary"
          withBackground={false}
          withBorder={false}
          screenReaderLabel="Show account summary"
        />
      </Tooltip>
    </React.Fragment>)
  }

  renderIcon(account) {
    const isOpen = this.props.isOpen
    return <IconButton withBackground={false} withBorder={false}
                       screenReaderLabel={(isOpen) ? 'Collapse sub-accounts' : 'Expand sub-accounts'} margin="x-small"
                       onClick={() => this.props.handleIconClick(account.id)}>
      {(isOpen) ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
    </IconButton>
  }
}

export default Account