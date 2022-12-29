const AliyunUtils = require('../lib/aliyun')
const QiniuUtils = require('../lib/qiniu')
const TencentUtils = require('../lib/tencent')
module.exports = {
  getUtils (provider, providerConfig = {}) {
    let utils = {}
    switch (provider) {
      case 'aliyun': utils = new AliyunUtils({ providerConfig }); break
      case 'qiniu': utils = new QiniuUtils({ providerConfig }); break
      case 'tencent': utils = new TencentUtils({ providerConfig }); break
      default: utils = new AliyunUtils({ providerConfig })
    }
    return utils
  }
}
