class Utils {
  config = {}
  client = {}
  constructor (options = {}) {
    this.config = options.providerConfig || options.config || {}
  }
  /**
   * 检查提供的云服务商配置对象是否合规
   * @return {Boolean} true 表示参数合规 false表示不合规 
   */
  checkConfig () {
    console.log('没有继承并实现 checkConfig') 
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
