import React from 'react'
import PropTypes from 'prop-types'
import parseLinkHeader from 'parse-link-header'

import { List } from '@instructure/ui-list'
import { Link } from '@instructure/ui-link'

import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'

import { Loading } from './Loading'
import { Button, IconButton } from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Spinner } from '@instructure/ui-spinner'


/**
 * Simple component to display all the sub-account from where we are.
 */
class AccountsTree extends React.Component {

  static propTypes = {
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    canvasUrl: PropTypes.string.isRequired,
    accountId: PropTypes.number.isRequired,
    accountName: PropTypes.string.isRequired,
    handle403: PropTypes.func.isRequired,
    handleError: PropTypes.func.isRequired
  }

  state = {
    accounts: null,
    open: {},
    tryLoading: true,
    loadAll: false,
    loadingAll: false
  }

  componentDidMount() {

    const root = {}
    root[this.props.accountId] = { id: this.props.accountId, name: this.props.accountName }
    this.setState({ collections: root })

    if (this.state.tryLoading) {
      this.loadAccounts(this.props.accountId)
    }
  }

  async loadAll(accountId) {
    this.setState({
      loadAll: true,
      loadingAll: true
    })
    let url = this.props.url + '/api/v1/accounts/' + accountId + '/sub_accounts?per_page=100&recursive=true'
    const data = []
    do {
      const response = await fetch(url, {
        headers: new Headers({
          'Authorization': 'Bearer ' + this.props.token
        })
      })
      url = null
      if (response.ok) {
        const json = await response.json()
        data.push(...json)
        const links = parseLinkHeader(response.headers.get('Link'))
        if (links.next)
          url = links.next.url
      }
    } while (url)
    const collections = this.updateCollections(data)
    const open = Object.values(collections).filter(account => account.collections).map(account => account.id)
    this.setState({
      collections: collections,
      open: open,
      loadingAll: false
    })

  }

  loadAccounts(accountId) {
    // TODO, need to handle proper paging
    return fetch(this.props.url + '/api/v1/accounts/' + accountId + '/sub_accounts?per_page=100', {
      headers: new Headers({
        'Authorization': 'Bearer ' + this.props.token
      })
    }).then(response => {
      if (!response.ok) {
        if (response.status === 403) {
          return this.props.handle403()
        } else if (response.status === 401) {
          const authHeader = response.headers.get('WWW-Authenticate')
          if (authHeader && !authHeader.includes('proxy')) {
            return this.props.handle403()
          } else {
            throw new Error('You don\'t have permission to see the list of accounts. Or your session has expired, please try relaunching the tool')
          }
        } else {
          throw new Error('Bad response: ' + response.status)
        }
      }
      return response
    }).then(response => response.json()
    ).then(json => {
      this.setState({
        collections: this.updateCollections(json, [accountId])
      })
    }).catch(reason => {
      this.props.handleError(reason)
    }).finally(() => {
      this.setState({ tryLoading: false })
    })
  }

  updateCollections(json, loadedAccounts) {
    /* eslint-disable no-param-reassign */
    var collections = json
      .map(account => ({
        id: account.id,
        name: account.name,
        sis_id: account.sis_account_id,
        parent_id: account.parent_account_id
      }))
      .reduce((collections, account) => {
        collections[account.id] = account
        return collections
      }, {})

    // If we don't have accounts that got loaded assume it's everything in the loaded data
    loadedAccounts = loadedAccounts || Object.keys(collections)

    // Build map of parents to array of children
    const children = {}
    Object.values(collections).forEach(account => (children[account.parent_id] = children[account.parent_id] || []).push(account.id))
    collections = { ...this.state.collections, ...collections }
    // Set the account that we know have no children
    loadedAccounts.forEach(account => collections[account].collections = [])
    // Update all the children
    Object.entries(children).forEach(([parent, children]) => collections[parent].collections = children)
    return collections
  }


  render() {
    return (<React.Fragment>
      {(this.state.tryLoading) ? <Loading/> : this.renderData()}
    </React.Fragment>)
  }

  renderData() {
    const collections = this.state.collections
    return <React.Fragment>
      <Button onClick={() => this.loadAll(this.props.accountId)}
              interaction={this.state.loadAll ? 'disabled' : 'enabled'}>Expand All</Button>
      {this.renderList(collections, this.props.accountId)}
    </React.Fragment>

  }

  renderList(collections, id) {
    return <List itemSpacing="small">
      {this.renderListItems(collections, id)}
    </List>
  }

  renderListItems(collections, id) {
    const children = collections[id].collections
    // Shortcut if no children (we haven't loaded them yet
    if (!children) {
      return <List.Item key="loading"><Spinner renderTitle="Loading" size="small" margin="small"/></List.Item>
    }
    if (children.length === 0) {
      return <List.Item key="empty">
        <Text color="secondary">No sub-accounts</Text>
      </List.Item>
    } else {
      return children.map(child => {
        const item = collections[child]
        return <List.Item key={item.id}>
          {this.renderIcon(item)}
          <Link href={this.props.canvasUrl + '/accounts/' + item.id} target="_top">{item.name}</Link>
          {(item.sis_id) ? <Text size="small" color="secondary">({item.sis_id})</Text> : null}
          {(this.isOpen(item.id)) ? this.renderList(collections, item.id) : null}
        </List.Item>
      })
    }
  }

  renderIcon(item) {
    const isOpen = this.isOpen(item.id)
    return <IconButton withBackground={false} withBorder={false} screenReaderLabel="Toggle accounts" margin="x-small"
                       onClick={() => this.handleIconClick(item.id)}>
      {(isOpen) ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
    </IconButton>
  }

  handleIconClick(id) {
    this.toggle(id)
    if (!this.state.collections[id].collections) {
      this.loadAccounts(id)
    }
  }

  isOpen(id) {
    return this.state.open[id]
  }

  toggle(id) {
    this.setState((state) => {
      const update = {}
      update[id] = !state.open[id]
      return { open: { ...state.open, ...update }  }
      })
  }

}

export default AccountsTree