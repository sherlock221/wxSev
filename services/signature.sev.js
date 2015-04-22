/**
 * Created by abjia on 15-4-21.
 */
var jsSHA = require("jssha");
var http = require("http");
var https = require("https");
var querystring = require('querystring');
var urllib = require('urllib');

var access_token_url = "https://api.weixin.qq.com/cgi-bin/token";
var ticket_url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket";


//2小时后过期，需要重新获取数据后计算签名
var expireTime = 7200 - 100;
//var expireTime = 10;

//缓存验证
var cacheSignature = {};

//企业公众账号配置
var appList = require("../wx-account");


var signatureSev = {

    //获得数字签名
    getSignature: function (c_no, url, callBack) {
        var result;

        //当前公众账号
        var app = getApp("type",c_no,appList);

        //缓存中的
        var signatureObj =  cacheSignature[app.type] ? cacheSignature[app.type].signature  || "";


        // 如果缓存中已存在签名，则直接返回签名
        if (signatureObj && signatureObj.timestamp) {
            var t = createTimeStamp() - signatureObj.timestamp;
            console.log(signatureObj.url, url);

            console.log("时间: ",t);

            if (t < expireTime && signatureObj.url == url) {
                console.log('来自缓存....');
                result = {
                    nonceStr: signatureObj.nonceStr
                    , timestamp: signatureObj.timestamp
                    , appid: signatureObj.appid
                    , signature: signatureObj.signature
                    , url: signatureObj.url
                };
                callBack(result);
            }
            // 此处可能需要清理缓存当中已过期的数据
            else{
                //清除缓存
                delete cachedSignatures[url];
                //生成新签名
                console.log("获得签名....");
                getToken(url, app,callBack);
            }

        }
        //生成签名
        else {
            console.log("获得签名....");
            getToken(url, app,callBack);
        }
    }

};

/**
 * 获得token 有效期7200秒
 * success : {"access_token":"ACCESS_TOKEN","expires_in":7200}
 * error   : {"errcode":40013,"errmsg":"invalid appid"}
 * @param url
 * @param app
 * @param callBack
 */
var getToken = function (url, app, callBack) {
    urllib.request(access_token_url, {
        method: 'GET',
        data: {
            'grant_type': 'client_credential',
            'appid': app.appid,
            'secret': app.secret
        }
    }, function (err, data, res) {

        if(err)
            callBack(err);
        else{
            console.log("token res : ",data.toString());
            data = JSON.parse(data.toString());
            if(data.errcode){
                callBack(data);
                return;
            }

            app.signature =    app.signature || {};
            app.signature.access_token = data.access_token;

            getTicket(url, app, data.access_token, "jsapi",callBack);
        }
    });
}


/**
 * 获得ticket
 * @param url
 * @param app
 * @param access_token
 * @param callBack
 */
var getTicket = function (url, app, access_token, ticketType,callBack) {

    urllib.request(ticket_url, {
        method: 'GET',
        data: {
            'access_token': access_token,
            'type': ticketType
        }
    }, function (err, data, res) {
        if(err){
            callBack(err);
            return;
        }

        var str  = data.toString();

        data = JSON.parse(str);

        if(data.errcode){
            callBack(data);
            return;
        }

        app.signature =    app.signature || {};
        app.signature.ticket = data.ticket;
        app.signature.timestamp = createTimeStamp();

        //缓存app
        cacheSignature[app.type] = app;

        //var ts = createTimeStamp();
        //var nonceStr = createNonceStr();
        //var ticket = data.ticket;
        //var signature = calcSignature(ticket, nonceStr, ts, url);
        //
        //
        //console.log("ticket res :",ticket);
        //
        //var temp = {
        //    nonceStr: nonceStr
        //    , timestamp: ts,
        //    appid: app.appid
        //    , signature: signature
        //    , url: url
        //};

        //缓存
        //cachedSignatures[url] = temp;
        callBack(null,data);

    });
}



//计算签名
var calcSignature = function (ticket, noncestr, ts, url) {
    var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + ts + '&url=' + url;
    var shaObj = new jsSHA(str, 'TEXT');
    return shaObj.getHash('SHA-1', 'HEX');
}

// 随机字符串产生函数
var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

// 时间戳产生函数
var createTimeStamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

//获得app
var getApp  = function(key,value,arrayList){
    for(var i=0; i<arrayList.length;i ++){
        var obj = arrayList[i];
        if(obj[key] == value)
            return obj;
    }
}

module.exports = signatureSev;

