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

//缓存
var cachedSignatures = {};


//企业公众账号
var appList = require("../wx-account");




var signatureSev = {

    //获得数字签名
    getSignature: function (c_no, url, callBack) {
        var result;

        //当前公众账号
        var app = appList[c_no];
        var signatureObj = cachedSignatures[url];


        // 如果缓存中已存在签名，则直接返回签名
        if (signatureObj && signatureObj.timestamp) {
            var t = createTimeStamp() - signatureObj.timestamp;
            console.log(signatureObj.url, url);

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

        }

        //生成签名
        else {
            getToken(url, app, callBack);
        }
    }

};


//获得token
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

            data = JSON.parse(data.toString());
            if(data.errcode){
                callBack(data.errmsg);
                return;
            }

            console.log("token res : ",data);
            getTicket(url, app, data.access_token, callBack);
        }

    });
}

//获得ticket
var getTicket = function (url, app, access_token, callBack) {

    urllib.request(ticket_url, {
        method: 'GET',
        data: {
            'access_token': access_token,
            'type': 'jsapi'
        }
    }, function (err, data, res) {
        if(err){
            callBack(err);
            return;
        }

        var str  = data.toString();

        data = JSON.parse(str);

        if(data.errcode){
            callBack(data.errmsg);
            return;
        }

        var ts = createTimeStamp();
        var nonceStr = createNonceStr();
        var ticket = data.ticket;
        var signature = calcSignature(ticket, nonceStr, ts, url);

        var temp = {
            nonceStr: nonceStr
            , timestamp: ts,
            appid: app.appid
            , signature: signature
            , url: url
        };

        callBack(null,temp);

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

module.exports = signatureSev;

