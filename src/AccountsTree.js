import React from 'react'
import PropTypes from 'prop-types'
import parseLinkHeader from 'parse-link-header'

import { Loading } from './Loading'
import { Button } from '@instructure/ui-buttons'
import { Heading } from '@instructure/ui-heading'
import { TextInput } from '@instructure/ui-text-input'
import ListAccounts from './ListAccounts'
import { View } from '@instructure/ui-view'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Spinner } from '@instructure/ui-spinner'
import * as utils from './utils'

const PER_PAGE = 100

/**
 * Simple component to display all the sub-account from where we are.
 */
class AccountsTree extends React.Component {

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
    search: '',
    searchPosition: 0,
    open: {},
    tryLoading: true,
    loadAll: false,
    loadingAll: false,
    collections: null
  }

  // Mapping from account ID to React ref
  accountRefs = []

  componentDidMount() {
    const root = {}
    root[this.props.accountId] = { id: this.props.accountId, name: this.props.accountName }
    this.setState({ collections: root })

    if (this.state.tryLoading) {
      this.loadAccounts(this.props.accountId).catch(this.handleError)
    }
  }

  handleSearchChange = (e, value) => this.setState({
    search: value,
    messages: null,
    from: null
  })

  async loadAccountsRecursive(accountId, openAll = false) {
    this.setState({
      loadAll: true,
      loadingAll: true
    })
    let url = this.props.url + '/api/v1/accounts/' + accountId + '/sub_accounts?per_page=' + PER_PAGE + '&recursive=true'
    const data = await this.loadAll(url)
    const collections = this.updateCollections(data)

    this.setState({
      collections: collections,
      loadingAll: false
    })
  }

  loadAll = async (startUrl) => {
    const data = []
    let url = startUrl
    do {
      const response = await utils.fetchWithAuth(url, this.props.token).then(this.handleError)
      url = null
      const json = await response.json()
      data.push(...json)
      const links = parseLinkHeader(response.headers.get('Link'))
      if (links && links.next)
        url = links.next.url
    } while (url)
    return data
  }

  async loadAccounts(accountId) {
    return this.loadAll(this.props.url + '/api/v1/accounts/' + accountId + '/sub_accounts?per_page=' + PER_PAGE)
      .then(json => {
        this.setState({
          collections: this.updateCollections(json, [accountId])
        })
      })
      .finally(() => {
        this.setState({ tryLoading: false })
      })
  }

  handleError = (response) => {
    if (!response.ok) {
      if (response.status === 403) {
        this.props.handle403()
      } else if (response.status === 401) {
        const authHeader = response.headers.get('WWW-Authenticate')
        if (authHeader && !authHeader.includes('proxy')) {
          this.props.handle403()
        } else {
          this.props.handleError('You don\'t have permission to see the list of accounts. Or your session has expired, please try relaunching the tool')
        }
      } else {
        this.props.handleError('Bad response: ' + response.status)
      }
      return Promise.reject()
    }
    return response
  }

  /**
   * @param {[]} json The new data to load.
   * @param {*[]} loadedAccounts The account IDs that have been loaded and so we will have results for.
   */
  updateCollections(json, loadedAccounts) {
    /* eslint-disable no-param-reassign */
    var collections = json
      .map(account => ({
        id: account.id,
        name: account.name,
        sis_id: account.sis_account_id,
        parent_id: account.parent_account_id
      }))
      .reduce((collections, account) => {
        collections[account.id] = account
        return collections
      }, {})

    // If we don't have accounts that got loaded assume it's everything in the loaded data
    loadedAccounts = loadedAccounts || Object.keys(collections)

    // Build map of parents to array of children
    const children = {}
    Object.values(collections).forEach(account => (children[account.parent_id] = children[account.parent_id] || []).push(account.id))
    collections = { ...this.state.collections, ...collections }
    // Set the account that we know have no children
    loadedAccounts.forEach(account => collections[account].collections = [])
    // Update all the children
    Object.entries(children).forEach(([parent, children]) => collections[parent].collections = children)
    return collections
  }

  handleSearch = (e) => {
    this.loadAndSearch().catch(this.props.handleError)
    e.preventDefault()
  }

  loadAndSearch = async () => {
    this.setState({ searchMessages: []})
    if (!this.state.loadAll) {
      await this.loadAccountsRecursive(this.props.accountId)
    }
    const accountId = this.props.accountId
    const search = this.state.search.toLowerCase()
    const from = this.state.from
    const result = this.search(search, accountId, from)
    if (result && result.length > 0) {
      const match = result.shift()
      const toOpen = result.reduce((open, id) => {
        open[id] = true
        return open
      }, {})
      this.setState({
        open: { ...this.state.open, ...toOpen },
        from: match
      }, () => {
        // Have to do this after we have expanded the nodes.
        const accountElement = this.accountRefs[match]
        if (accountElement) {
          accountElement.scrollIntoView({ behavior: 'smooth', block: 'center'})
        }
      })
    } else {
      if(from) {
        this.setState({
          searchMessages: [{ type: "error", text: "No more matches" }],
          from: null
        })
      } else {
        this.setState({ searchMessages: [{ type: "error", text: "No matches" }] })
      }
    }
  }

  accountRef = (accountId, ref) => {
    this.accountRefs[accountId] = ref
  }

  /**
   * We return null to indicate we haven't found anything.
   * An empty array to indicate that the location we were searching from previously has been found
   * A non empty array when we matched
   */
  search = (search, accountId, from) => {
    const collections = this.state.collections
    const children = collections[accountId].collections
    let foundFrom = false
    if (!from & collections[accountId].name.toLowerCase().includes(search)) {
      return [accountId]
    }
    if (accountId === from) {
      from = null
      foundFrom = true
    }
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const result = this.search(search, children[i], from)
        if (result) {
          if (result.length === 0) {
            from = null
            foundFrom = true
          } else {
            result.push(accountId)
            return result
          }
        }
      }
    }
    return foundFrom?[]:null
  }

  render() {
    return (<React.Fragment>
      {(this.state.tryLoading) ? <Loading/> : this.renderData()}
    </React.Fragment>)
  }

  renderData() {
    const collections = this.state.collections
    // Attempting to do this with flexbox resulted in the stick positioning not working
    return <React.Fragment>
      <View>
        <Heading level="h1" > View Sub-accounts </Heading> 
      </View>
      <View as="div" position="sticky" insetBlockStart="0" textAlign="end" >
        <form style={{ display: 'inline' }} onSubmit={this.handleSearch}>
          <TextInput
            messages={this.state.searchMessages} width="15rem"
            renderAfterInput={this.state.loadingAll ?
              <Spinner size="x-small" renderTitle="Loading sub-accounts"/> : null}
            renderLabel={<ScreenReaderContent>Search sub-accounts</ScreenReaderContent>}
            value={this.state.search} onChange={this.handleSearchChange} display="inline-block"
            placeholder="Search sub-accounts"/>
          <Button display="inline-block" type="submit" margin="small"
                  interaction={this.state.loadingAll ? 'disabled' : 'enabled'}>Find</Button>
        </form>
      </View>
      <ListAccounts id={this.props.accountId} collections={collections} canvasUrl={this.props.canvasUrl}
                    open={this.state.open} handleIconClick={this.handleIconClick} accountRef={this.accountRef}
                    focused={this.state.from}
                    url={this.props.url}
                    token={this.props.token}
      />
    </React.Fragment>
  }


  handleIconClick = (id) => {
    this.toggle(id)
    if (!this.state.collections[id].collections) {
      this.loadAccounts(id).catch(this.props.handleError)
    }
  }

  isOpen(id) {
    return this.state.open[id]
  }

  toggle(id) {
    this.setState((state) => {
      const update = {}
      update[id] = !state.open[id]
      return { open: { ...state.open, ...update } }
    })
  }

}

export default AccountsTree