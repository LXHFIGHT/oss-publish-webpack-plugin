/*
 * @Author       : liuxuhao
 * @LastEditors  : lxhfight lxhfight1@gmail.com
 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const chalk = require('chalk')
const ora = require('ora')
const utils = require('./utils')
const config = require('./config')

class OSSPublishPlugin {
  queue = []
  totalTaskAmount = 0 // 整体上传任务数
  isUploading = 0
  autoPublish = false // 是否自动发布阿里云
  /** 发布询问 */
  answer = [] // 当自动发布关闭时，answer为允许发布的字符串数组，输入数组内任一值都允许发布
  /** 网速好的同学可以通过增加同时上传任务和缩短轮训时间提升速度 */
  thread = 0 // 最多支持多少个上传任务同时间执行
  duration = 0 // 轮训查看任务队列的时间间隔(单位：毫秒)
  clearPrefixList = [] // 每次发版前需要清空存储桶文件的前缀，如果传空则表示不需要清空
  utils = {} // 对应云服务商的工具方法
  /** 
   * @param {String} options.provider 云服务提供商，目前仅支持：阿里云 aliyun (默认) 和 七牛云 qiniu 
   * @param {Object} options.providerConfig 云服务提供商工具方法对象参数
   * 创建云服务运营商客户端的配置参数
   * 阿里云OSS：
   * @param {String} providerConfig.region： region填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。  
   * @param {String} providerConfig.accessKeyId:  阿里云账号的accessKeyId // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
   * @param {String} providerConfig.accessKeySecret: 阿里云账号的accessKeySecret
   * @param {String} providerConfig.bucket: 存储桶的名称
   * 七牛云KODO：
   * @param {String} providerConfig.region: region填写Bucket所在地域。 华东 Zone_z0 华北 Zone_z1 华南 Zone_z2 北美 Zone_na0
   * @param {String} providerConfig.accessKey: 七牛云账号的accessKey 
   * @param {String} providerConfig.secretKey: 七牛云账号的secretKey
   * @param {String} providerConfig.bucket: 存储桶的名称
   */ 
  constructor (options = {}) {
    this.options = options
    this.autoPublish = options.autoPublish || false
    this.answer = options.answer && Array.isArray(options.answer) ? options.answer : ['y', 'Y', 'yes']
    this.thread = options.thread || 5
    this.duration = options.duration || 10
    this.clearPrefixList = options.clearPrefixList || []
    const provider = options.provider && config.providers.includes(options.provider) ? options.provider : 'aliyun'
    const providerConfig = options.ossConfig || options.providerConfig || null // ossConfig 为早期版本支持， 后续改为 providerConfig
    this.utils = utils.getUtils(provider, providerConfig) // 生成对应云服务商的工具方法对象
  }
  // [策略模式] 聚合判断运营商参数方法
  _checkProviderConfig () {
    return this.utils.checkConfig()
  }
  apply (compiler) {
    const _main = () => {
      if (this.clearPrefixList.length) {
        this.utils.clearBucket(this.clearPrefixList).then(() => {
          console.log('\n已清空存储桶旧数据.... \n已授权发布，正在发布数据中... ✅\n')
          this.createUploadTasks()
        })
      } else {
        this.createUploadTasks()
      }
    }
    const _execute = complication => {
      setTimeout(() => {
        console.log(`${chalk.green('\n\nBuild Complete\n\n')}`)
        if (!this._checkProviderConfig()) { return }
        if (this.autoPublish) {
          _main()
        } else {
          this.doAuthorizePublish().then(res => {
            _main()
          }).catch(() => {
            console.log('\n发布未授权，已取消 🚫\n')
            process.exit()
          })
        }
      })
    }
    // V4和以上版本
    if (compiler.hooks) {
      compiler.hooks.done.tap('done', _execute)
    } else { // V3版本
      compiler.plugin('done', _execute)
    }
  }
  // 授权发布操作
  doAuthorizePublish () {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question(`是否确认发布代码（输入 ${chalk.green(this.answer.join('/'))} 发布）`, answer => {
        if (this.answer.includes(answer)) {
          resolve(answer)
          return
        }
        reject(new Error('not authorized'))
      })
    })
  }
  createUploadTasks () {
    const ctx = this
    async function createTask (path, target = '/') {
      const dir = await fs.promises.opendir(path)
      for await (const dirent of dir) {
        if (dirent.isFile()) {
          const item = { localPath: `${path}/${dirent.name}`, targetPath: `${target}${dirent.name}` }
          ctx.queue.push(item)
          ctx.totalTaskAmount++
        } else if (dirent.isDirectory()) {
          createTask((path + '/' + dirent.name), target + dirent.name + '/')
        }
      }
    }
    const dir = path.resolve('dist/')
    createTask(dir, '/')
    this.publish()
  }
  // 发布到阿里云OSS
  publish () {
    let successCount = 0
    let failCount = 0
    const startTime = Date.now()
    const spinner = ora(`正在上传文件到云端....`)
    spinner.start()
    let timer = setInterval(() => {
      if (this.isUploading >= this.thread) {
        return  
      }
      if (this.queue.length) {
        this.isUploading++
        const item = this.queue.pop()
        this.utils.uploadFile({
          targetPath: item.targetPath, 
          localPath: item.localPath
        }).then(result => {
          this.isUploading--
          successCount++
          spinner.text = `${chalk.green(`文件成功上传`)} | OSS目标路径：${chalk.green(item.targetPath)}`
        }).catch(err => {
          this.isUploading--
          failCount++
          console.log(`Error: ${chalk.red(err)}`)
        })
      } else {
        if (successCount + failCount >= this.totalTaskAmount) {
          clearInterval(timer)
          spinner.stop()
          console.log(`
=======================================================
          
          已完成本次同步，成功${chalk.green(successCount)}个，失败${chalk.red(failCount)}个
          发布文件共耗时 ${chalk.green(parseFloat((Date.now() - startTime) / 1000))} 秒 :)
          
=======================================================\n`)
          !this.autoPublish && process.exit()
        }
      }
    }, this.duration)
  }
}

module.exports = OSSPublishPlugin
