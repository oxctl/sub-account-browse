import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Loading from './Loading.jsx'
import ListAccounts from './ListAccounts.jsx'
import * as utils from './utils'
import { Button } from '@instructure/ui-buttons'
import { Heading } from '@instructure/ui-heading'
import { TextInput } from '@instructure/ui-text-input'
import { View } from '@instructure/ui-view'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Spinner } from '@instructure/ui-spinner'
import { parseLinkHeader } from '@web3-storage/parse-link-header'

const PER_PAGE = 100

const AccountsTree = (props) => {
  const [state, setState] = useState({ search: '', open: {}, tryLoading: true, loadAll: false, loadingAll: false, collections: null })
  const collectionsRef = useRef(null)
  const accountRefs = useRef([])
  const updateState = (value, callback) => setState(current => { const next = typeof value === 'function' ? value(current) : value; if (next.collections) collectionsRef.current = next.collections; if (callback) setTimeout(callback, 0); return { ...current, ...next } })

  const handleError = async (response) => {
    if (response.ok) return response
    if (response.status === 403) props.handle403()
    else if (response.status === 401) {
      const authHeader = response.headers.get('WWW-Authenticate')
      if (authHeader && !authHeader.includes('proxy')) props.handle403()
      else props.handleError("You don't have permission to see the list of accounts. Or your session has expired, please try relaunching the tool")
    } else props.handleError('Bad response: ' + response.status)
    return Promise.reject()
  }
  const loadAll = async (startUrl) => {
    const data = []; let url = startUrl
    do {
      const response = await utils.fetchWithAuth(url, props.token).then(handleError)
      data.push(...await response.json())
      const links = parseLinkHeader(response.headers.get('Link'))
      url = links && links.next ? links.next.url : null
    } while (url)
    return data
  }
  const updateCollections = (json, loadedAccounts) => {
    let collections = json.map(account => ({ id: account.id, name: account.name, sis_id: account.sis_account_id, parent_id: account.parent_account_id }))
      .reduce((all, account) => { all[account.id] = account; return all }, {})
    loadedAccounts = loadedAccounts || Object.keys(collections)
    collections = { ...(collectionsRef.current || {}), ...collections }
    const children = {}
    Object.values(collections).forEach(account => { if (account.parent_id != null) (children[account.parent_id] ||= []).push(account.id) })
    loadedAccounts.forEach(id => { if (collections[id]) collections[id].collections = [] })
    Object.values(children).forEach(ids => ids.sort((a, b) => collections[a].name.localeCompare(collections[b].name)))
    Object.entries(children).forEach(([parent, ids]) => { if (collections[parent]) collections[parent].collections = ids })
    return collections
  }
  const loadAccounts = async (accountId) => {
    try {
      const json = await loadAll(props.url + '/api/v1/accounts/' + accountId + '/sub_accounts?per_page=' + PER_PAGE)
      updateState({ collections: updateCollections(json, [accountId]) })
    } finally { updateState({ tryLoading: false }) }
  }
  const loadAccountsRecursive = async (accountId) => {
    updateState({ loadAll: true, loadingAll: true })
    const data = await loadAll(props.url + '/api/v1/accounts/' + accountId + '/sub_accounts?per_page=' + PER_PAGE + '&recursive=true')
    const collections = updateCollections(data)
    updateState({ collections, loadingAll: false })
    return collections
  }
  useEffect(() => {
    const root = { [props.accountId]: { id: props.accountId, name: props.accountName } }
    collectionsRef.current = root
    updateState({ collections: root })
    loadAccounts(props.accountId).catch(props.handleError)
  }, [])
  const searchAccounts = (term, collections, rootId, from) => {
    const ordered = []
    const visit = (id) => {
      ordered.push(id)
      ;(collections[id].collections || []).forEach(visit)
    }
    visit(rootId)
    const matches = ordered.filter(id => collections[id].name.toLowerCase().includes(term))
    const start = from ? matches.indexOf(from) + 1 : 0
    return matches.length && start < matches.length ? matches[start] : null
  }
  const handleSearch = async (event) => {
    event.preventDefault()
    try {
      const collections = state.loadAll ? collectionsRef.current : await loadAccountsRecursive(props.accountId)
      const match = searchAccounts(state.search.toLowerCase(), collections, props.accountId, state.from)
      if (match) {
        const toOpen = {}
        let parent = collections[match].parent_id
        while (parent != null && parent !== props.accountId) {
          toOpen[parent] = true
          parent = collections[parent]?.parent_id
        }
        updateState({ open: { ...state.open, ...toOpen }, from: match }, () => accountRefs.current[match]?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      } else updateState({ searchMessages: [{ type: 'error', text: state.from ? 'No more matches' : 'No matches' }], from: state.from ? null : state.from })
    } catch (error) { props.handleError(error) }
  }
  const handleIconClick = (id) => {
    updateState(current => ({ open: { ...current.open, [id]: !current.open[id] } }))
    if (!state.collections[id].collections) loadAccounts(id).catch(props.handleError)
  }
  if (state.tryLoading) return <Loading />
  const collections = state.collections
  return <React.Fragment>
    <View><ScreenReaderContent><Heading level="h1">View Sub-accounts</Heading></ScreenReaderContent></View>
    <View as="div" position="sticky" insetBlockStart="0" textAlign="end" role="search">
      <form style={{ display: 'inline' }} onSubmit={handleSearch}>
        <TextInput messages={state.searchMessages} width="15rem" renderAfterInput={state.loadingAll ? <Spinner size="x-small" renderTitle="Loading sub-accounts"/> : null} renderLabel={<ScreenReaderContent>Search sub-accounts</ScreenReaderContent>} value={state.search} onChange={(e, value) => updateState({ search: value, searchMessages: null, from: null })} display="inline-block" placeholder="Search sub-accounts"/>
        <Button display="inline-block" type="submit" margin="small" interaction={state.loadingAll ? 'disabled' : 'enabled'}>Find</Button>
      </form>
    </View>
    <ListAccounts id={props.accountId} collections={collections} canvasUrl={props.canvasUrl} open={state.open} handleIconClick={handleIconClick} accountRef={(id, ref) => { accountRefs.current[id] = ref }} focused={state.from} url={props.url} token={props.token}/>
  </React.Fragment>
}

AccountsTree.propTypes = {
  token: PropTypes.string.isRequired, url: PropTypes.string.isRequired, canvasUrl: PropTypes.string.isRequired,
  accountId: PropTypes.number.isRequired, accountName: PropTypes.string.isRequired,
  handle403: PropTypes.func.isRequired, handleError: PropTypes.func.isRequired
}

export default AccountsTree
