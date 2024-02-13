import React from 'react'
import { List } from '@instructure/ui-list'
import { Spinner } from '@instructure/ui-spinner'
import { Text } from '@instructure/ui-text'
import Account from './Account.jsx'

class ListAccounts extends React.PureComponent {

  render() {
    return this.renderList(this.props.id)
  }

  renderList(id) {
    return <List itemSpacing="small">
      {this.renderListItems(id)}
    </List>
  }

  renderListItems(id) {
    const children = this.props.collections[id].collections
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
        const account = this.props.collections[child]
        return <List.Item key={account.id} elementRef={(ref) => this.props.accountRef(account.id, ref)}>
          <Account
            url={this.props.url}
            token={this.props.token}
            focused={this.props.focused}
            canvasUrl={this.props.canvasUrl}
            account={account}
            isOpen={this.isOpen(account.id)}
            handleIconClick={this.props.handleIconClick}/>
          {(this.isOpen(account.id)) ? this.renderList(account.id) : null}
        </List.Item>
      })
    }
  }


  isOpen(id) {
    return this.props.open[id]
  }

}

export default ListAccounts