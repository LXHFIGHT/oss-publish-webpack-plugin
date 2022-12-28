const qiniu = require('qiniu')
const chalk = require('chalk')
const Utils = require('./utils')
class QiniUtils extends Utils {
  qiniuConfig = null
  qiniuFormUploader = null
  bucketManager = null // 存储桶管理器
  constructor (options = {}) {
    super(options)
    if (!this.checkConfig(this.config)) { return }
    const { region, accessKey, secretKey } = this.config
    this.qiniuConfig = new qiniu.conf.Config()
    this.qiniuConfig.zone = qiniu.zone[region]
    this.qiniuFormUploader = new qiniu.form_up.FormUploader(this.qiniuConfig)
    this.client = new qiniu.auth.digest.Mac(accessKey, secretKey)
    this.bucketManager = new qiniu.rs.BucketManager(this.client, this.qiniuConfig)
  }
  // 重要：该操作确保 HistoryAPI路由模式下的项目可以正常根据指定路径访问
  _extraUploadMission (options) {
    const targetPath = 'errno-404'
    const bundle = {
      targetPath, 
      localPath: options.localPath
    }
    this.uploadFile(bundle)
  }
  clearBucket (prefixList = []) {
    if (!this.client) {
      return
    }
    const _handleDel = (key) => {
      return new Promise((resolve, reject) => {
        this.bucketManager.delete(this.config.bucket, key, (err, respBody, respInfo) => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            resolve({ respInfo, respBody })
          }
        })
      })
    }
    // 删除指定前缀的文件。
    const _deletePrefix = (prefix) => {
      const options = { limit: 1000, prefix }
      return new Promise((resolve, reject) => {
        this.bucketManager.listPrefix(this.config.bucket, options, (err, respBody, respInfo) => {
          if (err) {
            console.log(err)
            reject(err)
          }
          if (respInfo.statusCode === 200) {
            // 如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
            // 指定options里面的marker为这个值
            let items = respBody.items
            Promise.all(items.map((v) => _handleDel(v.key))).then(results => {
              resolve(results)
            }).catch(err => {
              reject(err)
            })
          } else {
            console.log(respInfo.statusCode)
            console.log(respBody)
          }
        })
      })
    }
    const queue = prefixList.map(str => { return _deletePrefix(str) })
    return Promise.all(queue)
  }
  // 检查提供的云服务商配置对象是否合规
  checkConfig () {
    if (!this.config || typeof this.config !== 'object') {
      console.log(`${chalk.red('请务必确保 OSSPublishPlugin 插件的构造方法中传入七牛云kodo客户端参数对象，\n否则请移除该插件')}`)
      return false
    }
    let requiredKeys = ['accessKey', 'secretKey', 'bucket']
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
  /** 见Utils父类 uploadFile */ 
  uploadFile (options = {}) {
    const { targetPath, localPath } = options
    const filePath = targetPath.indexOf('/') === 0 ? targetPath.substr(1) : targetPath
    const putExtra = new qiniu.form_up.PutExtra()
    const putPolicy = new qiniu.rs.PutPolicy({ scope: `${this.config.bucket}:${filePath}` })
    const uploadToken = putPolicy.uploadToken(this.client)
    putExtra.mimeType = null // 重置文件类型 需要在循环里重置！！！重要(否则上传至七牛文件类型都为text/html，css无法正常解析)
    if (targetPath === 'index.html') { this._extraUploadMission(options) }
    return new Promise((resolve, reject) => {
      // 文件上传
      this.qiniuFormUploader.putFile(
        uploadToken,
        filePath,
        localPath,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            throw respErr
          }
          if (respInfo.statusCode === 200) {
            resolve('success')
          } else {
            console.error(respInfo.statusCode)
            console.error(respBody)
            reject(new Error({ respInfo, respBody }))
          }
        }
      )
    })
  }
}
module.exports = QiniUtils
