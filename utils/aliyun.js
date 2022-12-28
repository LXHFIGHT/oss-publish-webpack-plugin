const OSS = require('ali-oss')
const chalk = require('chalk')
const Utils = require('./utils')

class AliyunUtils extends Utils {
  constructor (options = {}) {
    super(options)
    if (!this.checkConfig(this.config)) { return }
    this.client = new OSS(this.config)
  }
  checkConfig () {
    if (!this.config || typeof this.config !== 'object') {
      console.log(`${chalk.red('请务必确保 OSSPublishPlugin 插件的构造方法中传入阿里云OSS客户端参数对象，\n否则请移除该插件')}`)
      return false
    }
    let requiredKeys = ['region', 'accessKeyId', 'accessKeySecret', 'bucket']
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
  clearBucket (prefixList) {
    if (!this.client) {
      return
    }
    async function _handleDel (name, options) {
      try {
        await this.client.delete(name)
      } catch (error) {
        error.failObjectName = name
        return error
      }
    }
    // 删除指定前缀的文件。
    const _deletePrefix = (prefix) => {
      return new Promise((resolve, reject) => {
        this.client.list({
          prefix: prefix
        }).then(list => {
          list.objects = list.objects || []
          return Promise.all(list.objects.map((v) => _handleDel(v.name)))
        }).then(results => {
          resolve(results)
        }).catch(err => {
          reject(err)
        })
      })
    }
    const queue = prefixList.map(str => { return _deletePrefix(str) })
    return Promise.all(queue)
  }
  uploadFile (options = {}) {
    const { targetPath, localPath } = options
    return this.client.put(targetPath, localPath)
  }
}

module.exports = AliyunUtils
