import React from 'react'

import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view'


class Account extends React.Component {

  // We have to use the alert colour as the warning doesn't have a good accessibility value
  render() {
    const account = this.props.account
    return (<React.Fragment>
      {this.renderIcon(account)}
      <View position="relative"
        background={this.props.account.id === this.props.focused ? 'alert' : null}
      >
        <Link href={this.props.canvasUrl + '/accounts/' + account.id} target="_top" color={this.props.account.id === this.props.focused ? 'link-inverse' : null}>
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
                       screenReaderLabel={(isOpen) ? `Collapse ${account.name} sub-accounts` : `Expand ${account.name} sub-accounts`} margin="x-small"
                       onClick={() => this.props.handleIconClick(account.id)}>
      {(isOpen) ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
    </IconButton>
  }
}

export default Account
