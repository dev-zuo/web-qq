
/**
 * 路由相关
 * Created by kevin on 2017/11/9.
 */

var bodyParser = require('body-parser'); // post数据获取模块
var sprintf = require('sprintf-js').sprintf;  // sprintf()支持模块

var SqlDao = require('./SqlDao.js');  // 自定义数据封装模块
var dao = new SqlDao();

/**
 * 自定义模块，主要用来路由及相关API接口请求处理，在server.js里载入该模块，并执行 this.api()函数
 * @constructor
 */
function Router() {

    // 模块里面的start(app) 函数，用来处理ajax api请求 (这个项目基本用不到路由跳转页面，只有ajax请求, 路由跳转相关也是在这做)
    this.start = function (app) {

        // // add_fabric 图片上传
        // // http://www.jianshu.com/p/9533fd343784
        // app.post('/uploadImg', multer({storage: storage}).single('file'), function(req, res, next) {
        //     console.log(req.file);
        //     var customFileName = req.body.customFileName;
        //     // 将uploads/req.file.filename 的名字改为 customFileName
        //     // 读取文件，修改文件名
        //     fs.rename('uploads/' + req.file.filename, 'uploads/' + customFileName, function (err) {
        //         if (err) {
        //             throw err;
        //         }
        //         console.log('filename change done!');
        //     });
        //     res.json({
        //         err: null,
        //         //filePath:就是图片在项目中的存放路径
        //         // filePath: 'uploads/' + req.file.filename
        //         filePath: 'uploads/' + customFileName
        //     });
        // });
        //
        // // searchImg 图片上传
        // app.post('/searchImg', multer({storage: storage2}).single('file'), function(req, res, next) {
        //     console.log(req.file);
        //     res.json({
        //         err: null,
        //         //filePath:就是图片在项目中的存放路径
        //         filePath: './searchTemp/' + req.file.filename
        //     });
        // });

        // 用户获取POST提交的数据
        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

        // // session配置
        // app.use(session({
        //     //name: identityKey,
        //     name: 'fabric',   // 这里的name值得是cookie的name，默认cookie的name是：connect.sid
        //     secret: 'fabric_ltkj',  // 用来对session id相关的cookie进行签名
        //     saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
        //     resave: false,  // 是否每次都重新保存会话，建议false
        //     cookie: {
        //         // maxAge: 5 * 1000  // 有效期，单位是毫秒 5s
        //         maxAge: 1800 * 1000 // 有效期 30分钟
        //     }
        // }));

        // 上面的配置只能保证固定时间后session过期，当有操作时实时刷新session时间
        // Node.js刷新session过期时间 http://www.cnblogs.com/jaxu/p/5180814.html
        // use this middleware to reset cookie expiration time
        // when user hit page every time
        // app.use(function (req, res, next) {
        //     req.session._garbage = new Date();
        //     req.session.touch();
        //     next();
        // });


        //
        // //设置跨域访问
        // app.all('*', function(req, res, next) {
        //     res.header("Access-Control-Allow-Origin", "*");
        //     res.header("Access-Control-Allow-Headers", "X-Requested-With");
        //     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        //     res.header("X-Powered-By",' 3.2.1');
        //     res.header("Content-Type", "application/json;charset=utf-8");
        //     next();
        // });


        /*
         * 关于路由 GET、POST 方式选择规范
         * 1. GET：用来读取数据库数据，判断字段是否存在，不对数据库进行更改操作
         * 2. POST：需要更改数据库的操作, 登录验证及需要保护的安全机密数据等
         --------------------------------------------------------------------- */
        urls_remote('/loginM', app, loginM.opt); // 登录管理

        // 主页
        app.use('/', function (req, res) {
            res.render('welcome.art', {
            });
        });
    };
}

module.exports = Router;

/**
 * 封装: 对于同一个URL请求可能要写两种路由方法(app.get/app.post), 这里将两种操作封装为一个函数
 * 某个url => 对应函数操作, 不用post，get请求分开写
 * @param url   请求URL
 * @param app   express app
 * @param operateFunc   对应函数操作 回调
 */
function urls_remote(url, app, operateFunc) {
    app.get(url, function (req, res) {
        var data = req.query;   // get请求时，传的数据，通过req.query.属性 来获取，将req.query 封装为data, 不能传数组对象等
        zuoLog("处理 GET 请求 '" + req.url + "' action:'" + req.query.action + "'");
        data.url = url;

        // // 每次请求是验证用户session是否过期，过期了就让登录, 单页面应用主要是ajax请求，ajax里面需要根据sessionLost值处理跳转
        // if (req.session.user === undefined) {
        //     res.json({'sessionLost': true});
        //     return;
        // }
        operateFunc(app, data, req, res);
    });
    app.post(url, function (req, res) {
        // var data = JSON.parse(req.body.data); // req.body已经将数据转成了js对象
        var data = req.body.data; // post请求时，传的数据，通过req.body.属性 来获取，将req.body 封装为data
        data.action = req.body.action;
        zuoLog("处理 POST 请求 '" + req.url + "' action:'" + req.body.action + "'");
        data.url = url;

        // // 每次请求是验证用户session是否过期，过期了就让登录， 单页面应用主要是ajax请求，ajax里面需要根据sessionLost值处理跳转
        // if (req.body.action !== 'login' && req.session.user === undefined) {
        //     res.json({'sessionLost': true});
        //     return;
        // }

        operateFunc(app, data, req, res);
    });
}


var loginM = new LoginM();

function LoginM() {
    var that = this;
    this.opt = function (app, data, req, res) {
        var action = data.action;

        switch (action) {
            case 'login':
                that.login(app, data, req, res);
                break;
        }
    };

    this.login = function (app, data, req, res) {
        console.log(data);
        res.render('chat.art', {
            un:data.un
        });
    }
}


/**
 * 根据请求req获取客户端ip
 * @param req request对象
 * @returns {*} string ip
 */
function getIp (req) {
    var ip = (req.connection.remoteAddress || req.socket.remoteAddress).split('::ffff:')[1];
    console.log(ip);
    if (ip === undefined) { // localhost
        ip = '127.0.0.1';
    }
    return ip;
}

/**
 * 自定义console.log
 * @param str 需要打印的字符串
 */
function zuoLog(str) {
    // 单纯的字符串相加是不可行的，会破坏对象
    console.log("***************************");
    console.log(str);
    console.log("***************************");
}

/**
 * 时间转换函数
 * mysql模块从数据库查询的timestamp时间，前端显示为"2017-10-24T16:00:00.000Z", 需要转换
 * @param timestampData  查询的时间
 * @param format  格式 'yyyy-MM-dd h:m:s'  等
 * @returns {*}
 */
function getDateFromTimeStamp(timestampData, format) {
    var date = {
        "M+": timestampData.getMonth() + 1,
        "d+": timestampData.getDate(),
        "h+": timestampData.getHours(),
        "m+": timestampData.getMinutes(),
        "s+": timestampData.getSeconds(),
        "q+": Math.floor((timestampData.getMonth() + 3) / 3),
        "S+": timestampData.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (timestampData.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}