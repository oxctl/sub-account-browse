import React from 'react'
import PropTypes from 'prop-types'
import { Billboard } from '@instructure/ui-billboard'
import { IconWarningLine } from '@instructure/ui-icons'

// Displays a message across the screen.
const Error = ({ heading, message, children }) => {
  return (message) ? (<Billboard
      margin="x-large"
      heading={heading}
      message={message}
      size="large"
      hero={(size) => <IconWarningLine size={size}/>}
    />) : children
}

Error.propTypes = {
  // The heading of the error.
  heading: PropTypes.string,
  // The message to be displayed.
  message: PropTypes.string,
  // The nodes to hide when there is a message.
  children: PropTypes.node.isRequired
}


Error.defaultProps = {
  heading: "Error",
  message: null
}

export default Error
