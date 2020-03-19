const instConfig = require('@instructure/ui-eslint-config')
delete instConfig.rules['notice/notice'];
module.exports = {
  ...instConfig,
}
