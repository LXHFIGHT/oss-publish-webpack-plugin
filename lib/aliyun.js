const OSS = require('ali-oss')
const Utils = require('../utils/utils')

class AliyunUtils extends Utils {
  constructor (options = {}) {
    super(options)
    if (!this.checkConfig(this.config)) { return }
    this.client = new OSS(this.config)
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
