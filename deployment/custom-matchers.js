export const customMatchers = {
  async toBeHumanVisible(locator, options = {}) {
    const timeout = options.timeout || 5000
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const isVisible = await locator.evaluate(element => {
        const rect = element.getBoundingClientRect()
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        )
      })

      if (isVisible) {
        return {
          message: () => `expected ${locator} not to be visible in viewport`,
          pass: true
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      message: () => `expected ${locator} to be visible in viewport`,
      pass: false
    }
  }
}