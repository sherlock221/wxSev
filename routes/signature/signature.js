/**
 * Created by abjia on 15-4-21.
 */
var express = require('express');
var router = express.Router();
var signatureSev = require("../../services/signature.sev.js");

/**
 * 获取微信验证
 */
router.post('/', function(req, res, next) {
    console.log("signature...");
    //标识
    var c_no = req.body.c_no;
    //当前url地址
    var url = req.body.url;

    if(!url || !c_no){
        res.json( {"errcode":400,"errmsg":"参数不匹配"});
        return;
    }


    var supportSignature = 0;
    var ua = req.headers['user-agent'];
    var wechatInfo = ua.match(/MicroMessenger\/([\d\.]+)/i);
    //获得微信版本
    console.log("当前设备微信ua:",ua);

    if(wechatInfo){
        console.log("当前设备微信version:",wechatInfo[1]);
        //支持数字签名
        if(wechatInfo[1] >= "6.0.2"){
            supportSignature = 1;
            console.log("当前设备支持签名:",supportSignature);
        }
    }



    //获得数字签名
    signatureSev.getSignature(c_no,url,function(err,data){
        if(err){
            console.log(err);
            data = err
        }

        //追加support字段
        data["supportSignature"] =supportSignature;
        res.json(data);
    });

});

module.exports = router;
