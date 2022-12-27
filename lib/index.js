/*
 * @Author       : liuxuhao
 * @LastEditors  : lxhfight lxhfight1@gmail.com
 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const chalk = require('chalk')
const ora = require('ora')
const ossUtils = require('../utils/oss')
const OSS = require('ali-oss')

class OSSPublishPlugin {
  queue = []
  totalTaskAmount = 0 // 整体上传任务数
  isUploading = 0
  client = null
  autoPublish = false // 是否自动发布阿里云
  /** 发布询问 */
  answer = [] // 当自动发布关闭时，answer为允许发布的字符串数组，输入数组内任一值都允许发布
  /** 网速好的同学可以通过增加同时上传任务和缩短轮训时间提升速度 */
  thread = 0 // 最多支持多少个上传任务同时间执行
  duration = 0 // 轮训查看任务队列的时间间隔(单位：毫秒)
  clearPrefixList = [] // 每次发版前需要清空存储桶文件的前缀，如果传空则表示不需要清空
  /** 
   * 创建阿里云OSS客户端的配置参数
   * @param {String} ossConfig.region： region填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。  
   * @param {String} ossConfig.accessKeyId:  阿里云账号的accessKeyId // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
   * @param {String} ossConfig.accessKeySecret: 阿里云账号的accessKeySecret
   * @param {String} ossConfig.bucket: 存储桶的名称
   */ 
  ossConfig = {} 
  constructor (options = {}) {
    this.options = options
    this.autoPublish = options.autoPublish || false
    this.answer = options.answer && Array.isArray(options.answer) ? options.answer : ['y', 'Y', 'yes']
    this.thread = options.thread || 5
    this.duration = options.duration || 10
    this.ossConfig = options.ossConfig || null
    this.clearPrefixList = options.clearPrefixList || []
    if (!this._checkOSSConfig()) { return }
    this.client = new OSS(this.ossConfig)
  }
  _checkOSSConfig () {
    if (!this.ossConfig || typeof this.ossConfig !== 'object') {
      console.log(`${chalk.red('请务必确保 OSSPublishPlugin 插件的构造方法中传入阿里云OSS客户端参数对象，\n否则请移除该插件')}`)
      return false
    }
    let requiredKeys = ['region', 'accessKeyId', 'accessKeySecret', 'bucket']
    for (let item of Object.keys(this.ossConfig)) {
      for (let i = 0; i < requiredKeys.length; i++) {
        if (requiredKeys[i] === item && this.ossConfig[item]) {
          requiredKeys.splice(i, 1)
          i--
        }
      }
    }
    if (requiredKeys.length) {
      console.log(`${chalk.red('OSSPublishPlugin 插件 ossConfig 对象中还缺少' + requiredKeys.join(', ') + '等参数')}`)
      return false
    }
    return true
  }
  apply (compiler) {
    const _main = () => {
      if (this.clearPrefixList.length) {
        ossUtils.clearBucket(this.client, this.clearPrefixList).then(() => {
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
        if (!this._checkOSSConfig()) { return }
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
    const spinner = ora(`正在上传文件到阿里云....`)
    spinner.start()
    let timer = setInterval(() => {
      if (this.isUploading >= this.thread) {
        return  
      }
      if (this.queue.length) {
        this.isUploading++
        const item = this.queue.pop()
        this.client.put(item.targetPath, item.localPath).then(result => {
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
