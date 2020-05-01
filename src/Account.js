import React from 'react'
import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view'

class Account extends React.Component {

  render() {
    const account = this.props.account
    return (<React.Fragment>
      {this.renderIcon(account)}
      <View position="relative" background={this.props.account.id === this.props.focused ? 'secondary':null}>
        <Link href={this.props.canvasUrl + '/accounts/' + account.id} target="_top">
          {account.name}
        </Link>
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