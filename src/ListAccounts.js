import React from 'react'
import PropTypes from 'prop-types'
import { List } from '@instructure/ui-list'
import { Link } from '@instructure/ui-link'

import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'


import { Loading } from './Loading'
import { IconButton } from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'


class ListAccounts extends React.Component {

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
    open: [],
    tryLoading: true
  }

  componentDidMount() {

    const root = {}
    root[this.props.accountId] = {id: this.props.accountId, name: this.props.accountName}
    this.setState({collections: root})

    if (this.state.tryLoading) {
      this.loadAccounts(this.props.accountId)
    }
  }

  loadAccounts(accountId) {
    return fetch(this.props.url + '/api/v1/accounts/' + accountId + '/sub_accounts', {
      headers: new Headers({
        'Authorization': 'Bearer ' + this.props.token
      })
    }).then(response => {
      if (!response.ok) {
        if (response.status === 403) {
          this.props.handle403()
        } else if (response.status === 401) {
          const authHeader = response.headers.get('WWW-Authenticate')
          if (authHeader && !authHeader.includes('proxy')) {
            return this.props.handle403()
          } else {
            throw new Error('You don\'t have permission to see the list of accounts.')
          }
        } else {
          throw new Error('Bad response: ' + response.status)
        }
      }
      return response
    }).then(response => response.json()
    ).then(json => {
      /* eslint-disable no-param-reassign */
      var collections = json
        .map(account => ({ id: account.id, name: account.name, sis_id: account.sis_account_id }))
        .reduce((collections, account) => {
          collections[account.id] = account
          return collections
        }, {})
      /* eslint-enable no-param-reassign */
      let parents = Object.keys(collections)
      collections = {...this.state.collections, ...collections}
      collections[accountId] = {
        ...collections[accountId],
        collections: parents
      }
      this.setState({
        collections: collections
      })
    }).catch(reason => {
      this.props.handleError(reason)
    }).finally(() => {
      this.setState({ tryLoading: false })
    })
  }

  render() {
    return (<React.Fragment>
      {(this.state.tryLoading) ? <Loading/> : this.renderData()}
    </React.Fragment>)
  }

  renderData() {
    var collections = this.state.collections
    return <React.Fragment>
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
    return children.map(child => {
      const item = collections[child]
      return <List.Item key={item.id}>
        <IconButton withBackground={false} withBorder={false} screenReaderLabel="Toggle accounts" margin="x-small" onClick={() => this.handleIconClick(item.id)}>
          {(this.isOpen(item.id))?<IconArrowUpLine size="x-small"/>:<IconArrowDownLine size="x-small"/>}
        </IconButton>
        <Link href={this.props.canvasUrl+ "/accounts/"+ item.id} target="_top">{item.name}</Link>
        {(item.sis_id)?<Text size="small" color="secondary">({item.sis_id})</Text>:null}
        {(this.state.open.includes(item.id))?this.renderList(collections, item.id):null}
      </List.Item>
    })
  }

  handleIconClick(id) {
    if(!this.state.collections[id].collections) {
      this.loadAccounts(id).then(() => this.toggle(id))
    } else {
      this.toggle(id)
    }
  }

  isOpen(id) {
    return this.state.open.includes(id)
  }

  toggle(id) {
    if(this.isOpen(id)) {
      this.setState({open: this.state.open.filter(item => item !== id)})
    } else {
      this.setState({open: this.state.open.concat(id)})
    }
  }

}

export default ListAccounts