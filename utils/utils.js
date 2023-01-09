const config = require('./../config')
const chalk = require('chalk')

class Utils {
  provider = ''
  config = {}
  client = {}
  constructor (options = {}) {
    this.provider = options.provider
    this.config = options.providerConfig || {}
  }
  /**
   * 检查提供的云服务商配置对象是否合规
   * @return {Boolean} true 表示参数合规 false表示不合规 
   */
  checkConfig () {
    const providerInfo = config[this.provider] || { name: '--', requiredKeys: [] }
    if (typeof this.config !== 'object') {
      console.log(`${chalk.red('请务必确保 OSSPublishPlugin 插件的构造方法中传入' + providerInfo.name + '对象存储客户端参数对象，\n否则请移除该插件')}`)
      return false
    }
    let requiredKeys = providerInfo.requiredKeys
    for (let item of Object.keys(this.config)) {
      for (let i = 0; i < requiredKeys.length; i++) {
        if (requiredKeys[i] === item && this.config[item]) {
          requiredKeys.splice(i, 1)
          i--
        }
      }
    }
    if (requiredKeys.length) {
      console.log(`${chalk.red('OSSPublishPlugin 插件 providerConfig 对象中还缺少' + requiredKeys.join(', ') + '等参数')}`)
      return false
    }
    return true
  }
  /**
   * 清空存储桶内指定前缀（数组）的文件
   * @param {Array} prefixList 
   * @return {Promise} 清空操作的回调Promise
   */
  clearBucket (prefixList = []) {
    return new Promise((resolve) => { 
      console.log('没有继承并实现 clearBucket', prefixList) 
      resolve()
    }) 
  }
  /**
   * [继承实现] 上传文件： 返回一个Promise
   * @param {String} options.targetPath 上传云空间的位置
   * @param {String} options.localPath 本地文件位置 上传云空间的位置
   * @return {Promise} 上传文件后的Promise
   */ 
  uploadFile (options = {}) {
    return new Promise((resolve) => { 
      console.log('没有继承并实现上传文件方法 uploadFile', options) 
      resolve()
    }) 
  }
}

module.exports = Utils
