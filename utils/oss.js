module.exports = {
  // 请求存储桶方法
  clearBucket: (client, prefixList) => {
    if (!client) {
      return
    }
    async function _handleDel (name, options) {
      try {
        await client.delete(name)
      } catch (error) {
        error.failObjectName = name
        return error
      }
    }
    // 删除指定前缀的文件。
    const _deletePrefix = (prefix) => {
      return new Promise((resolve, reject) => {
        client.list({
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
}