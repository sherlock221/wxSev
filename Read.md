##微信公众账号数字签名服务

###认证的微信公众账号
首先你得拥有一个通过认证了的微信公众号或者开发者帐号，没有通过认证的公众帐号。数字签名认证也能成功，但是分享信息是无法设置成功的；

###添加安全域名
在公众帐号平台后台添加app运行的域名地址，可以理解为为某个域名添加白名单功能
那么我在imzhiliao.com上的网页可以使用榕树下公众帐号的数字签名了

###生成数字签名
在微信公众平台后台上面能找到一个 appid 及 secret字符串
通过这两个数据，请求微信提供的两个公开API地址，生成对应的access_token后再生成ticket再通过规则加密成数字签名

注意，数字签名必须在服务端生成