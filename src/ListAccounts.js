import React from "react"
import { List } from '@instructure/ui-list'
import { Spinner } from '@instructure/ui-spinner'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'

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
        const item = this.props.collections[child]
        return <List.Item key={item.id}>
          {this.renderIcon(item)}
          <Link href={this.props.canvasUrl + '/accounts/' + item.id} target="_top">{item.name}</Link>
          {(item.sis_id) ? <Text size="small" color="secondary">({item.sis_id})</Text> : null}
          {(this.isOpen(item.id)) ? this.renderList(item.id) : null}
        </List.Item>
      })
    }
  }

  renderIcon(item) {
    const isOpen = this.isOpen(item.id)
    return <IconButton withBackground={false} withBorder={false} screenReaderLabel={(isOpen)?"Collapse sub-accounts":"Expand sub-accounts"} margin="x-small"
                       onClick={() => this.props.handleIconClick(item.id)}>
      {(isOpen) ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
    </IconButton>
  }

  isOpen(id) {
    return this.props.open[id]
  }

}

export default ListAccounts