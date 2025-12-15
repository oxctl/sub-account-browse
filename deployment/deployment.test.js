import { test, expect } from '@playwright/test'
import { dismissBetaBanner, getLtiIFrame, waitForNoSpinners, TEST_URL } from '@oxctl/deployment-test-utils'

test.describe('Test deployment', () => {
  test('The tool should load and display, (amongst other things,) a Find button.', async ({context, page}) => {
    await page.goto(TEST_URL)
    await dismissBetaBanner(page)
    const ltiIFrame = getLtiIFrame(page)
    await waitForNoSpinners(ltiIFrame)

    // Check there's the Find button on the page
    const button = page.getByRole('button', { name: 'Find' })
    await expect(button).toBeVisible({ timeout: 1000 })
  })
})
