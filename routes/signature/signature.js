/**
 * Created by abjia on 15-4-21.
 */
var express = require('express');
var router = express.Router();

var signatureSev = require("../../services/signature.sev.js");



router.post('/', function(req, res, next) {
    console.log("signature...");

    var c_no = req.body.c_no;
    var url = req.body.url;


    if(!url || !c_no){
        res.json({"error":"参数不匹配"});
        return;
    }

    //获得数字签名
    signatureSev.getSignature(c_no,url,function(err,data){
        if(err){
            console.log(err);
            data = {"error" : err};
        }
        res.json(data);
    });

});

module.exports = router;
