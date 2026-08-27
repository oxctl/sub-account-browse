import React from 'react'
import { List } from '@instructure/ui-list'
import { Spinner } from '@instructure/ui-spinner'
import { Text } from '@instructure/ui-text'
import Account from './Account.jsx'

const ListAccounts = React.memo((props) => {
  const isOpen = (id) => props.open[id]
  const renderList = (id) => {
    return <List itemSpacing="small">
      {renderListItems(id)}
    </List>
  }

  const renderListItems = (id) => {
    const children = props.collections[id].collections
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
        const account = props.collections[child]
        return <List.Item key={account.id} elementRef={(ref) => props.accountRef(account.id, ref)}>
          <Account
            url={props.url}
            token={props.token}
            focused={props.focused}
            canvasUrl={props.canvasUrl}
            account={account}
            isOpen={isOpen(account.id)}
            handleIconClick={props.handleIconClick}/>
          {(isOpen(account.id)) ? renderList(account.id) : null}
        </List.Item>
      })
    }
  }
  return renderList(props.id)
})

export default ListAccounts
