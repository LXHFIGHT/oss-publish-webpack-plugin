const AliyunUtils = require('../lib/aliyun')
const QiniuUtils = require('../lib/qiniu')
const TencentUtils = require('../lib/tencent')
const readline = require('readline')
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
