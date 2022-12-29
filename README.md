<center>
  <h1>OSS Publish Webpack Plugin</h1>
</center>
<center>
a webpack(V3/V4) plugin for publish vue project to Aliyun OSS and Qiniu Kodo.
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
|v1.2.0 |腾讯云COS| 2022-12-29 |

### webpack.config.js
下面仅为示例代码，具体详细描述查看下文 [构造方法参数描述](#OPTIONS)

```javascript
const OSSPublishPlugin = require('oss-publish-webpack-plugin')

module.exports = {
  // ......
  plugins: [
    // ...... 等其他webpack插件
    new OSSPublishPlugin({
      // 构造方法配置参数, 下面仅为示例，具体描述见后面构造方法参数描述
      provider: 'qiniu',
      providerConfig:  {
        region: 'Zone_z2',
        accessKey: 'P********************b',
        secretKey: 'd********************A',
        bucket: '{bucketName}'
      },
      autoPublish: true,
      clearPrefixList: ['static/css', 'static/js', 'static/img']
    })
  ]
}
```

## <a id="OPTIONS">Options</a>
以下具体介绍 `oss-publish-webpack-plugin` 支持的构造方法参数

|参数名 | 描述 |类型 | 默认值 |
|:-- |:--|:-- |:--|
| `provider` | 云计算运营商标识（详见下文 `provider` 介绍） | String | 'aliyun' |
| `providerConfig` <strong style="color: red;">重要</strong> |运营商SDK对应工具方法的配置对象（详见下文 `providerConfig` 介绍）| Object | -- |
| `clearPrefixList` |每次上传文件前需要清空存储桶中文件前缀，如果不传或空数组则代表不需要清空| Array | [] |
| `autoPublish` | 是否无需命令行询问直接在编译后上传云端, true表示直接上传，false则需要询问后发布 | Boolean | false|
| `answer` | 当 `autoPublish` 为false时，定义发布前命令行询问后填写的正确回复选项，输入数组内任一值都允许发布 | Array | ['y','Y','yes'] |
| `thread` | 定义最多支持同时执行的上传任务数，性能和网速越强，数额可以设置越大，建议取数在 1~10之间  | Number | 5 |

<br/>

### provider 云计算运营商标识

<br>

|运营商名称 | 标识 | 状态 |
|:-- |:--|:-- |
|阿里云 OSS | aliyun | V0.3.0 已支持 |
|七牛云 Kodo | qiniu | V0.9.0 已支持 |
|腾讯云 COS | tencent | 实现中 |
|亚马逊云 S3 | aws | 计划中 |
|华为云 OBS | huaweicloud | 计划中 |

<br/>

### providerConfig 对象存储配置详述

<br>

1. **阿里云 OSS**

|参数名 | 类型 | 描述 |
|:-- |:--|:-- |
|region | String | 存储桶所在地域名称，以华东1（杭州）为例，Region填写为oss-cn-hangzhou，点击[查看公共云下OSS Region详细对照表](https://help.aliyun.com/document_detail/31837.html) |
|accessKeyId | String | 阿里云账号的accessKeyId。注意：阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户 |
|accessKeySecret | String | 阿里云账号的accessKeySecret |
|bucket | String | 存储桶的名称 |

<br/>

2. **七牛云 Kodo**

|参数名 | 类型 | 描述 |
|:-- |:--|:-- |
|region | String | 存储空间所在地域标识：华东 Zone_z0、 华北 Zone_z1、 华南 Zone_z2 和 北美 Zone_na0 |
|accessKey | String | 七牛云账号的accessKey |
|secretKey | String | 七牛云账号的secretKey |
|bucket | String | 存储空间的名称 |

<br>

3. **腾讯云 COS**

|参数名 | 类型 | 描述 |
|:-- |:--|:-- |
|region | String | 腾讯云存储桶托管机房分布地区的地域标识，以广州为例，Region填写为ap-guangzhou，点击[查看公有云地域列表](https://cloud.tencent.com/document/product/436/6224#.E4.B8.AD.E5.9B.BD.E5.A4.A7.E9.99.86.E5.9C.B0.E5.9F.9F) |
|secretId | String | 腾讯云账号的secretId |
|secretKey | String | 腾讯云账号的secretKey |
|bucket | String | 存储桶的名称 |

<br>

## Guide

### 阿里云OSS存储桶配置引导
to be continue...

### 七牛云kodo存储桶配置引导
to be continue...

### 腾讯云COS存储桶配置引导
* 查看腾讯云 [使用 COS 静态网站功能搭建前端单页应用](https://cloud.tencent.com/document/product/436/64575)
* 查看搭建前端单页应用过程中的 [常见问题](https://cloud.tencent.com/document/product/436/64575#.E5.B8.B8.E8.A7.81.E9.97.AE.E9.A2.98)