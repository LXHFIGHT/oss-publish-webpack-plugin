const OBSClient = require('esdk-obs-nodejs')
const Utils = require('../utils/utils')

class HuaweiCloudUtils extends Utils {
  constructor (options = {}) {
    super(options)
    if (!this.checkConfig(this.config)) { return }
    this.client = new OBSClient({
      access_key_id: this.config.access_key_id,
      secret_access_key: this.config.secret_access_key,
      server : this.config.server
    })
  }
  clearBucket (prefixList) {
    if (!this.client) {
      return
    }
    const _handleDel = (key) => {
      return new Promise((resolve, reject) => {
        this.client.deleteObject({
          Bucket: this.config.bucket, /* 填入您自己的存储桶，必须字段 */
          Key: key  
        }, function (err, data) {
          if (err) {
            reject(err)
            return
          }
          resolve(data)
        })
      })
    }
    // 删除指定前缀的文件。
    const _deletePrefix = (prefix) => {
      return new Promise((resolve, reject) => {
        this.client.listObjects({
          Bucket: this.config.bucket, /* 填入您自己的存储桶，必须字段 */
          Prefix: prefix /* Prefix表示列出的object的key以prefix开始，非必须 */
        }, function (err, result) {
          if (err) {
            reject(err)
            return
          }
          if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
            Promise.all(result.InterfaceResult.Contents.map((v) => _handleDel(v.Key))).then(results => {
              resolve(results)
            }).catch(err => {
              reject(err)
            })
          } else {
            reject(err)
          }
        })
      })
    }
    const queue = prefixList.map(str => { return _deletePrefix(str) })
    return Promise.all(queue)
  }
  uploadFile (options = {}) {
    // 详见文档：https://cloud.tencent.com/document/product/436/64980#.E9.AB.98.E7.BA.A7.E4.B8.8A.E4.BC.A0
    const { targetPath, localPath: filePath } = options
    return new Promise((resolve, reject) => {
      this.client.putObject({
        Bucket: this.config.bucket,
        Key: targetPath.indexOf('/') === 0 ? targetPath.substr(1) : targetPath,
        SourceFile: filePath
      }, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })
  }
}

module.exports = HuaweiCloudUtils
