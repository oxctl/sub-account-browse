# Deployment Tests

Automated UI tests for Browse Sub-accounts LTI tool functionality using Playwright. These are tests run by [GitHub Actions](.github/workflows/test_deployment.yml) when a deployment is made to beta or prod, against that Canvas instance. HTML reporter and video recording are enabled for all test runs and uploaded as an artifact of the run.

## Test Overview

The deployment tests verify that the Browse Sub-accounts LTI tool works correctly after being deployed to a Canvas instance. Specifically, they check:

 * Initial Access
   - Tool loads properly in Canvas
   - User can authenticate and grant LTI access
 * Subaccount Navigation
   - Users can view the subaccount tree structure
   - Expanding and collapsing subaccount nodes works
 * Search Functionality
   - Search results appear correctly
   - Page auto-scrolls to found items

## Setup

1. Install dependencies:

```sh
npm install
npm run install-browsers
```

2. Set environment variables in `.env` (see [`.env.example`](.env.example) for example variables):

```dotenv
# Required
OAUTH_TOKEN=an-OAuth2-access-token 
CANVAS_HOST=testing-host,-e.g.-https://oxeval.instructure.com/
TOOL_ID=the-lti-tool-id

# Optional
NETWORK_PRESET=Simulates network conditions (for example, 3g, 4g, etc.)
```

See [manual token generation](https://canvas.instructure.com/doc/api/file.oauth.html#manual-token-generation) for more information on how to get an OAuth2 access token.

## Test Structure

* `auth.setup.js`: Handles authentication and LTI access grant
* `deployment-tests.test.js`: Main test suite for LTi tool
* `test-utils.js`: Helper functions and network presets

## Test Execution

Tests run automatically when deploying to beta or production environments. Each run:

* Executes against the target Canvas instance
* Records videos of test execution
* Generates HTML reports
* Uploads artifacts to the GitHub actions run

## Running Tests Locally

Run all deployment tests:

```sh
npm run test
```

Run in CI mode:
```sh
npm run test:ci
```

## Configuration

 * Timeout: 60 seconds
 * Retries: 2 attempts on failure

## Test Artifacts

 * HTML reports generated
 * Video recordings for all test runs
 * All artifacts uploaded to GitHub Actions run

## Custom Matchers

Includes a custom `toBeHumanVisible` matcher that checks if an element is fully visible in the viewport using `getBoundingClientRect()`.

## Developing

The following utilities are useful for test development:

### Test Screenshots

Screenshots can be captured using the [`screenshot(locator, testInfo)`](#screenshot) utility function.

### <a name="screenshot"></a> `screenshot(locator, testInfo)`

Takes a full-page screenshot of a specific page element during test execution. Screenshots are numbered sequentially and saved to the test output directory.

**Parameters:**
 - `locator` - Playwright Locator object representing the element to screenshot
 - `testInfo` - Playwright TestInfo object containing test metadata

**Example:**
```js
const main = page.locator('main')
await screenshot(main, testInfo)
```

### Network Throttling

Tests can simulate different network conditions using the `NETWORK_PRESET` environment variable:

 * 3G
 * 4G
 * Slow-4G
 * Fast-3G
 * WiFi
 * Offline