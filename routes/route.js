/**
 * 路由配置列表
 * sherlock221b
 * @type {*|exports}
 */
var express = require('express');

var  routes =
    {
        "/": require("./index"),
        "/signature": require("./signature/signature")
    }

var init  = function(app){
    console.log("初始化路由!");
    for(var r  in routes){
        app.use(r,routes[r]);
    }
}

exports.init = init;

