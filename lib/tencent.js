const COS = require('cos-nodejs-sdk-v5')
const Utils = require('../utils/utils')

class TencentUtils extends Utils {
  constructor (options = {}) {
    super(options)
    if (!this.checkConfig(this.config)) { return }
    this.client = new COS({
      SecretId: this.config.SecretId || this.config.secretId,
      SecretKey: this.config.SecretKey || this.config.secretKey
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
          Region: this.config.region, /* 存储桶所在地域，例如ap-beijing，必须字段 */
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
        this.client.getBucket({
          Bucket: this.config.bucket, /* 填入您自己的存储桶，必须字段 */
          Region: this.config.region, /* 存储桶所在地域，例如ap-beijing，必须字段 */
          Prefix: prefix /* Prefix表示列出的object的key以prefix开始，非必须 */
        }, function (err, data) {
          if (err) {
            reject(err)
            return
          }
          Promise.all(data.Contents.map((v) => _handleDel(v.Key))).then(results => {
            resolve(results)
          }).catch(err => {
            reject(err)
          })
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
      this.client.uploadFile({
        Bucket: this.config.bucket,
        Region: this.config.region,
        Key: targetPath.indexOf('/') === 0 ? targetPath.substr(1) : targetPath,
        FilePath: filePath
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

module.exports = TencentUtils
