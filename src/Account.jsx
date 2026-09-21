import React, { useCallback } from 'react'

import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowDownLine, IconArrowUpLine } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view'


const Account = ({ account, focused, canvasUrl, includeSisId, isOpen, handleIconClick }) => {
  // We have to use the alert colour as the warning doesn't have a good accessibility value
  const handleClick = useCallback(() => handleIconClick(account.id), [handleIconClick, account.id])

  return (<React.Fragment>
      <IconButton withBackground={false} withBorder={false}
                  screenReaderLabel={isOpen ? `Collapse ${account.name} sub-accounts` : `Expand ${account.name} sub-accounts`} margin="x-small"
                  onClick={handleClick}>
        {isOpen ? <IconArrowUpLine size="x-small"/> : <IconArrowDownLine size="x-small"/>}
      </IconButton>
      <View position="relative"
        background={account.id === focused ? 'alert' : null}
      >
        <Link href={canvasUrl + '/accounts/' + account.id} target="_top" color={account.id === focused ? 'link-inverse' : null}>
          {account.name}
        </Link>
      </View>
      {(includeSisId && account.sis_id) ?
        <Text size="small" color="secondary">({account.sis_id})</Text> : null}
    </React.Fragment>)
}

export default Account
