<center>
  <h1>OSS Publish Webpack Plugin</h1>
</center>
<center>
a webpack(V3/V4) plugin for publish vue project to aliyun oss 
</center>

## Install

```shell
npm i --save-dev oss-publish-webpack-plugin
```

## Usage
该插件可以帮助你在完成前端项目编译打包后，将 `dist` 目录中的内容发布到云计算运营商的对象存储桶中，目前支持列表如下：
|版本|云服务商| 日期 |
|:--|:--|:--|
|v0.3.0 |阿里云OSS| 2022-12-27 |
|v0.9.0 |七牛云kodo| 2022-12-28 |

### webpack.config.js
```javascript
const OSSPublishPlugin = require('oss-publish-webpack-plugin')

module.exports = {
  // ......
  plugins: [
    // ...... 等其他webpack插件
    new OSSPublishPlugin({
      // 构造方法配置参数
    })
  ]
}
```

## Options
以下具体介绍 `oss-publish-webpack-plugin` 支持的构造方法参数

|名称 | 描述 |类型 | 默认值 |
|:-- |:--|:-- |:--|
| `provider` | 云计算运营商标识（详见下文 `provider` 介绍） | String | 'aliyun' |
| `providerConfig` <strong style="color: red;">重要</strong> |运营商SDK对应工具方法的配置对象（详见下文 `providerConfig` 介绍）| Object | -- |
| `clearPrefixList` |每次上传文件前需要清空存储桶中文件前缀，如果不传或空数组则代表不需要清空| Array | [] |
| `autoPublish` | 是否无需命令行询问直接在编译后上传云端, true表示直接
| `answer` | 当 `autoPublish` 为false时，定义发布前命令行询问后填写的正确回复选项，输入数组内任一值都允许发布 | Array | ['y','Y','yes'] |
| `thread` | 定义最多支持同时执行的上传任务数，性能和网速越强，数额可以设置越大，建议取数在 1~10之间  | Number | 5 |

### provider介绍
|名称 | 标识 | 状态 |
|:-- |:--|:-- |
|阿里云 OSS | aliyun | V0.3.0 已支持 |
|七牛云 Kodo | qiniu | V0.9.0 已支持 |
|腾讯云 COS | tencent | 计划中 |
|亚马逊云 S3 | aws | 计划中 |

### providerConfig 详述
1. **阿里云 OSS** 对应的配置:
```JavaScript
* region {String}: region填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。  
* accessKeyId {String}: 阿里云账号的accessKeyId // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
* accessKeySecret {String}: 阿里云账号的accessKeySecret
* bucket {String}: 存储桶的名称
```
2. **七牛云 Kodo** 对应的配置:
```JavaScript
* region {String}: region填写Bucket所在地域。 华东 Zone_z0 华北 Zone_z1 华南 Zone_z2 北美 Zone_na0
* accessKey {String}: 七牛云账号的accessKey 
* secretKey {String}: 七牛云账号的secretKey
* bucket {String}: 存储桶的名称
```
<br>

## Guide

### 阿里云OSS存储桶配置引导
to be continue...

### 七牛云kodo存储桶配置引导
to be continue...