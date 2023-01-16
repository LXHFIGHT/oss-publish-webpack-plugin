const readline = require('readline')
const AliyunUtils = require('../lib/aliyun')
const QiniuUtils = require('../lib/qiniu')
const TencentUtils = require('../lib/tencent')
const HuaweiCloudUtils = require('../lib/huaweiCloud')
module.exports = {
  getUtils (provider, providerConfig = {}) {
    let utils = {}
    switch (provider) {
      case 'aliyun': utils = new AliyunUtils({ providerConfig, provider }); break
      case 'qiniu': utils = new QiniuUtils({ providerConfig, provider }); break
      case 'tencent': utils = new TencentUtils({ providerConfig, provider }); break
      case 'huaweicloud': utils = new HuaweiCloudUtils({ providerConfig, provider }); break
      default: utils = new AliyunUtils({ providerConfig, provider })
    }
    return utils
  },
  askQuestion (question, answers = []) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question(question, answer => {
        if (answers.includes(answer)) {
          resolve(answer)
          return
        }
        reject(new Error('not authorized'))
      })
    })
  }
}
