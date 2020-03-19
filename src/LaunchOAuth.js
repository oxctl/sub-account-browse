import React from 'react'
import PropTypes from 'prop-types'
import {Billboard} from '@instructure/ui-billboard'
import {IconIntegrationsLine} from '@instructure/ui-icons'


/**
 * This either displays the child components or it displays a message asking the user to login.
 * It adds a listener to the window waiting for a message to say that the login has completed.
 * TODO: We should have a different error when the jwt is also missing
 */
class LaunchOAuth extends React.Component {

  static propTypes = {
    // Used for sending to the proxy
    jwt: PropTypes.string,
    children: PropTypes.node.isRequired,
    url: PropTypes.string.isRequired,
    handleLoginDone: PropTypes.func,
    needsToken: PropTypes.bool
  }

  static defaultProps = {
    jwt: null,
    needsToken: true,
    handleLoginDone: () => {}
  }

  constructor(props) {
    super(props)
    this.formRef = React.createRef()
  }

  componentDidMount() {
    window.addEventListener("message", (event) => {
      if (event.data === 'token') {
        this.props.handleLoginDone()
      }
    }, false)
  }

  handleLogin = () => {
    this.formRef.current.submit()
  }

  render() {
    return (this.props.needsToken)?this.renderLogin():this.renderChildren()
  }

  renderChildren() {
    return this.props.children
  }

  renderLogin() {
    return <React.Fragment>
      <Billboard
        heading="Access Needed"
        message="You need to grant access to your account to use this tool."
        hero={(size) => <IconIntegrationsLine size={size}/>}
        size="large"
        onClick={() => this.handleLogin()}
      />
      <form ref={this.formRef} method="post" action={this.props.url} target="_blank">
        <input type="hidden" name="access_token" value={this.props.jwt ? this.props.jwt : ""}/>
      </form>
    </React.Fragment>
  }
}

export default LaunchOAuth