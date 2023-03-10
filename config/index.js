// 常规配置文件

module.exports = {
  providers: {
    aliyun: { 
      name: '阿里云',
      requiredKeys: ['region', 'accessKeyId', 'accessKeySecret', 'bucket']
    },
    qiniu: { 
      name: '七牛云',
      requiredKeys: ['region', 'accessKey', 'secretKey', 'bucket']
    },
    tencent: { 
      name: '腾讯云',
      requiredKeys: ['region', 'secretId', 'secretKey', 'bucket']
    },
    huaweicloud: {
      name: '华为云',
      requiredKeys: ['server', 'access_key_id', 'secret_access_key', 'bucket']
    },
    aws: {
      name: '亚马逊云',
      requiredKeys: ['region', 'accessKeyId', 'secretAccessKey', 'bucket']
    }
  }
}
