import React from 'react'
import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view'
import { Tooltip } from '@instructure/ui-tooltip'
import { Spinner } from '@instructure/ui-spinner'
import parseLinkHeader from 'parse-link-header'
import * as utils from './utils.js'


class Account extends React.Component {

  state = {
    isLoading: false,
    isLoaded: false,
    error: null,
    courseCount: null
  }

  loadCourses = async () => {
    this.setState({ isLoading: true })
    const response = await utils.fetchWithAuth(this.props.url + '/api/v1/accounts/' + this.props.account.id + '/courses?per_page=1', this.props.token)
      .then(utils.rejectFailures)
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
        return <Spinner size="x-small"/>
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
        <Tooltip
          renderTip={this.renderTip}
          placement="end"
          on={['hover', 'focus']}
          onShowContent={this.showInfo}
        >
        <Link href={this.props.canvasUrl + '/accounts/' + account.id} target="_top">
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
                       screenReaderLabel={(isOpen) ? 'Collapse sub-accounts' : 'Expand sub-accounts'} margin="x-small"
                       onClick={() => this.props.handleIconClick(account.id)}>
      {(isOpen) ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
    </IconButton>
  }
}

export default Account