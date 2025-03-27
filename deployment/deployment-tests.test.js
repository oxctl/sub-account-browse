import { test, expect } from '@playwright/test'
import { goToTool, addNetworkThrottle, NETWORK_PRESETS, screenshot, getToolAnchor } from './test-utils'
import { networkPreset } from './constants'
import { customMatchers } from './custom-matchers'

expect.extend(customMatchers)
test('Subaccount browse deployment tests', async ({context, page}, testInfo) => {
  const TOP_LEVEL_SUBACCOUNT_NAME = 'View Sub-accounts'
  const SECOND_LEVEL_SUBACCOUNT_NAME = 'VSA3'
  const LOWER_LEVEL_SUBACCOUNT_NAME = 'VSA3 sub acc 3'

  let ltiToolFrame

  await test.step('Load the tool', async () => {
    if (networkPreset) {
      await addNetworkThrottle(context, page, NETWORK_PRESETS[networkPreset])
    }
    ltiToolFrame = await goToTool(page)
    if (page.url().includes('beta')) {
      // the warning banner on beta interferes with some click operations so dismiss it
      await page.getByRole('button', {name: 'Close warning'}).click()
    }
  })

  await test.step('Tool loads', async () => {
    const placeholder = await getToolAnchor(ltiToolFrame)
    await expect(placeholder).toBeVisible()
  })

  await test.step('Can expand and collapse subaccounts', async () => {
    const secondLevelSubaccount = ltiToolFrame.getByRole('link', {name: SECOND_LEVEL_SUBACCOUNT_NAME, exact: true })
    await expect(secondLevelSubaccount).not.toBeVisible()
    ltiToolFrame.getByRole('button', {name: `Expand ${TOP_LEVEL_SUBACCOUNT_NAME} sub-accounts`, exact: true}).click()
    await expect(secondLevelSubaccount).toBeVisible()
    ltiToolFrame.getByRole('button', {name: `Collapse ${TOP_LEVEL_SUBACCOUNT_NAME} sub-accounts`, exact: true}).click()
    await expect(secondLevelSubaccount).not.toBeVisible()
  })

  await test.step('Search works and scrolls to result', async () => {
    const searchTerm = LOWER_LEVEL_SUBACCOUNT_NAME
    const searchResult = ltiToolFrame.getByRole('link', {name: searchTerm, exact: true})
    await expect(searchResult).not.toBeVisible()
    const searchBox = ltiToolFrame.getByPlaceholder('Search sub-accounts', {exact: true})
    await searchBox.fill(searchTerm)
    await ltiToolFrame.getByRole('button', {name: 'Find'}).click()
    await expect(searchResult).toBeVisible()
    await expect(searchResult).toBeHumanVisible()
  })
})