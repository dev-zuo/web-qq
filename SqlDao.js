
/**
 * 数据库操作相关
 * Created by kevin on 2017/11/9.
 */

// 载入mysql模块
var mysql = require('mysql');

// 创建数据库连接池
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234567Abc,.',
    database: 'achat_node'
});

function SqlDao() {

    /**
     * 数据库查询操作
     * @param sql 要执行的sql语句
     * @param res 出错返回
     * @param success_callback 执行成功后的回调
     */
    this.query = function (sql, res, success_callback) {

        // nodejs中，mysql连接——是每次查询连接一次数据库，还是启动node时连接数据库，关闭时再断开好呢？
        // https://segmentfault.com/q/1010000002787902
        pool.getConnection(function (err, conn) {
            if (err) console.log("POOL ==> " + err);

            conn.query(sql, function (error, results, fields) {
                // if (error) throw error;
                if (error) {
                    console.log('发生错误：' + error);
                    res.send("<p style='color:red'>执行：" + sql + "<br> 发生错误：" + error + "</p>");
                    return;
                }
                // 如果查询成功，执行传入的函数，解析结果
                console.log("执行：" + sql);
                success_callback(results);
                // console.log(results.insertId);  新增的id
                // console.log(results.affectedRows);  // 影响的行数
                // console.log(results.changedRows); // 修改的行数
                // setTimeout(function (args) { console.log(success_callback) } ,10000);

                conn.release();
            });
        });
    };
}

module.exports = SqlDao;