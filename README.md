XML 转为 JSON

> 
>
> 在我们日常开发当中可能会有 **XML** 数据交互需求， 这时候处理某个节点就比较麻烦， 然后自己动手封装了一下， 嘻嘻，多的不说 ，直接上代码~
>
> 



### 1.使用

```html
<script src="src/js/xmlToJson.min.js"></script>
```

```javascript
//待转换的xml字符串
let xmlText = `
    <userInfo version="1.0.0">
        <token>12366666666</token>
        <isAdmin>true</isAdmin>
        <account>admin</account>
        <userName>管理员</userName>
        <id>12345678</id>
        <mobile>13928281818</mobile>
        <alias>猛追湾彭于晏</alias>
        <roles>
            <role id="123456" name="超级管理员"></role>
            <role id="12345" name="管理员"></role>
        </roles>
        <orgs>
            <org id="123456" name="四川移动"></org>
            <org id="12345" name="成都移动分公司"></org>
        </orgs>
    </userInfo>
`;

let jsonData = XmlToJson.parse(xmlText, {
    textKey: 'value',
    conversionkeyMap: {
        userInfo: 'userData',
        roles: 'userRoles'
    }
}); //转换后的JSON数据
console.log(jsonData);
```



### 2.参数说明

|        参数名         |  类型   | 是否必填（Y/N） |       描述        |
| :-------------------: | :-----: | :-------------: | :---------------: |
|       xmlString       | String  |        Y        |     xml字符串     |
|         conf          | Object  |        N        |     配置信息      |
|     conf.textKey      | String  |        N        |    属性text值     |
|    conf.jsonString    | Boolean |        N        |    json字符串     |
| conf.conversionkeyMap | Object  |        N        | 替换数据Key(深度) |

---
### 更多功能正在更新中...


