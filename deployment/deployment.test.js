import { test, expect } from '@playwright/test'
import { dismissBetaBanner, getLtiIFrame, waitForNoSpinners, TEST_URL, grantAccessIfNeeded } from '@oxctl/deployment-test-utils'

test.describe('Test deployment', () => {
  test('The tool should load and display, (amongst other things,) a Find button.', async ({ page, context }) => {
    await grantAccessIfNeeded(page, context, TEST_URL)
    await dismissBetaBanner(page)

    const ltiIFrame = getLtiIFrame(page)
    await waitForNoSpinners(ltiIFrame)

    // Check there's the Find button on the page - at root account, the tool takes a while to load
    const button = ltiIFrame.getByRole('button', { name: 'Find' })
    await expect(button).toBeVisible({ timeout: 10000 })
  })
})
