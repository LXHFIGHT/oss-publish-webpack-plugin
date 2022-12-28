const AliyunUtils = require('./aliyun')
const QiniuUtils = require('./qiniu')
module.exports = {
  getUtils (provider, providerConfig = {}) {
    let utils = {}
    switch (provider) {
      case 'aliyun': utils = new AliyunUtils({ providerConfig }); break
      case 'qiniu': utils = new QiniuUtils({ providerConfig }); break
      default: utils = new AliyunUtils({ providerConfig })
    }
    return utils
  }
}
