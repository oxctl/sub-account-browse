import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@instructure/ui-heading'
import { TreeBrowser } from '@instructure/ui-tree-browser'
import { List } from '@instructure/ui-list'
import { Link } from '@instructure/ui-link'

import { IconSubaccountsLine } from '@instructure/ui-icons'




import { Loading } from './Loading'
import { View } from '@instructure/ui-view'


class ListAccounts extends React.Component {

  static propTypes = {
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
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
            this.props.handle403()
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
      var collections = json
        .map(account => ({ id: account.id, name: account.name }))
        .reduce((collections, account) => {
          collections[account.id] = account
          return collections
        }, {})
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
      <Heading>Sub Accounts</Heading>
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
    const children = collections[id].collections;
    return children.map(child => {
      const item = collections[child]
      return <List.Item key={item.id}>
        <IconSubaccountsLine size="small" onClick={() => this.handleIconClick(item.id)}/>
        <View padding="small none" >
        <Link href={"https://oxeval.instructure.com/accounts/"+ item.id} target="_top">{item.name}</Link>
        </View>
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
    console.log(id);
  }

  toggle(id) {
    if(this.state.open.includes(id)) {
      this.setState({open: this.state.open.filter(item => item !== id)})
    } else {
      this.setState({open: this.state.open.concat(id)})
    }
  }

}

export default ListAccounts