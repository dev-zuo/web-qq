
/**
 * server.js 程序入口
 * Created by zuoxiaobai on 2017/11/9.
 */

// 导入express框架
var express = require('express');
var app = express();

// public静态文件
app.use(express.static('.'));

// artTemplate 模板渲染   DOC：https://aui.github.io/art-template/express/
app.engine('art', require('express-art-template'));
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production'
});

// 创建web服务器，监听8080端口
var server = app.listen('8082', function () {
    console.log('Achat-node Server is running, Connect to http://localhost:%d/', server.address().port);
});

// 配置路由
var Router = require('./Router.js');
var router = new Router();
router.start(app);