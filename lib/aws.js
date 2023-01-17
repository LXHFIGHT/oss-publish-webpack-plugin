/*
 * @Author       : lxhfight lxhfight1@gmail.com
 * @Date         : 2023-01-16 17:17:34
 * @LastEditors  : lxhfight lxhfight1@gmail.com
 * @LastEditTime : 2023-01-17 14:26:53
 * @FilePath     : /oss-publish-webpack-plugin/lib/huaweicloud copy.js
 * @Description  : 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { 
  S3Client, 
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand 
} = require('@aws-sdk/client-s3')
const { readFileSync } = require('fs')
const Utils = require('../utils/utils')

class AWSUtils extends Utils {
  constructor (options = {}) {
    super(options)
    if (!this.checkConfig(this.config)) { return }
    this.client = new S3Client({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region : this.config.region
    })
  }
  clearBucket (prefixList) {
    if (!this.client) {
      return
    }
    const _handleDel = (key) => {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      })
      return this.client.send(command)
    }
    // 删除指定前缀的文件。
    const _deletePrefix = (prefix) => {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: prefix
      })
      return new Promise((resolve, reject) => {
        this.client.send(command).then(data => {
          Promise.all(data.Contents.map((v) => _handleDel(v.Key))).then(results => {
            resolve(results)
          }).catch(err => {
            reject(err)
          })
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
    const body = readFileSync(localPath)
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Body: body,
      Key: targetPath
    })
    return this.client.send(command)
  }
}

module.exports = AWSUtils
