
/**
 * 通用js
 * Created by kevin on 2017/11/9.
 */

var $bodyObj = $('body');

/**
 * 封装 AJAX 通用请求操作
 * @param requestType   请求方式"POST", "GET"
 * @param url   请求url
 * @param data  传入的数据 必须是 {} 对象
 * @param action 进行的操作
 * @param optFunc  回调函数  optFunc(data){ } 将服务器返回的数据，让用户自己去处理
 * @param isAsync 是否异步执行回调函数，默认是true，可不填。 当值为false，请求开始后，阻塞程序，直到数据请求成功，执行完回调，才向下执行
 * 加isAsync这个参数是由于地图服务器改从数据库加载，后面的操作又依赖由此生成的地图对象，ajax请求地图配置时，如果异步执行回调，值会获取
 * 不到，只能阻塞等待执行完回调，再向下执行, 官方不推荐此操作，但这里必须这么做
 */
function ajax_request(requestType, url, action, data, optFunc, isAsync) {
    isAsync = (isAsync === undefined);
    // console.log(isAsync);
    // console.log(requestType + url + action + data);
    // console.log(optFunc);
    // 是否为 POST 请求
    var isPost = (requestType === "POST" || requestType === "post");

    // 数据处理，根据post或get定制数据
    // POST: 普通js对象 => jsonStr;
    // GET: js对象(键值对，且值不能是对象集合)
    var tempData = {};
    tempData["action"] = action;     // 具体url下的操作，比如 "/database" 这个url可能有很多个功能如: showTables、addTable等
    if (isPost) {
        tempData["data"] = data;      // 需要处理的数据
    } else { // 如果是 GET 请求，需要将json的data数据直接添加到tempData中
        // 两个对象合并为一个对象 https://segmentfault.com/q/1010000005018933?_ea=1075399
        data['action'] = action;
        tempData = data;
        // IE11及Edge不支持assign, chrome/Safari/Firefox都支持
        // tempData = Object.assign(tempData, data);
    }
    // console.log(tempData);
    // console.log(JSON.stringify(tempData));
    // ajax请求
    $.ajax({
        type: requestType,
        url: url,
        // dataType: "json",                   // 这里为了规范将传给服务器和要求服务器换回的数据都要求是json
        // 为什么要注释，当涉及到渲染模板传回来的html数据，用来刷新页面时(如showTables)，会出错，非json格式
        contentType: "application/json",    // 如果指定了该值，POST请求是只能传入json字符串，GET传js对象即可
        data: isPost ? JSON.stringify(tempData) : tempData,
        async: isAsync,    // 异步为false, 或 true
        success: function (jsonData) {
            // 如果后台session过期，登录
            // alert(jsonData.sessionLost);
            if (jsonData.sessionLost !== undefined) {
                window.location.href = "/login.html";
                return;
            }
            optFunc(jsonData);
        },
        error: function (err) {
            console.log("/************* Error_start *************/");
            console.log("'" + requestType + "请求" + url + " action:" + action + " 发生了错误!'");
            console.log(err);
            console.log("/************* Error_end *************/");
        }
    });
}
// BUG:自定义表加载数据为2条，添加表后数据刷新OK，关闭窗口，再点击自定义表，数据还是2条,要清除缓存才能看到实时数据
// IE11、Edge下ajax有缓存机制，数据无法实时刷新 http://blog.csdn.net/s8460049/article/details/52266817
$.ajaxSetup({cache: false});
// 原理是加了'_'的随机数 /zj_categoryLib?action=showCategorys&_=1498043677766


/**
 * 获取表单数据
 * Get the form data when Add submit: 获取id为'add-form' form表单的input数据
 * @returns {{}} return  add form data
 */
function getFormData() {
    var temp = $('form').serializeArray();
    // console.log('temp');
    console.log(temp);
    var data = {};
    for (var i = 0; i < temp.length; i++) { // 将属性对象 数组，转化为单个对象
        data[temp[i]['name']] = temp[i]['value'];
    }
    return data;
}

/**
 * 通用数据校验
 * 通用输入校验的前提是，必须包含 'fields' class, 如果是必填项，要有'must' class, rule为对应的正则表达式校验，label为字段名
 * eg: <label>表名:</label><input class="fields must" label="表名" rule="chEn" type="text">
 * @returns {boolean} 表单数据是否错误, 如果是就无法进行下一步
 */
function isFromDataError() {
    // get the fields
    var fieldsArr = $('.fields');
    var fields = '';
    var filedsValue = '';
    var filedsLabel = '';
    var filedsRule = '';
    for (var i = 0; i < fieldsArr.length; i++) {
        fields = $(fieldsArr[i]); // fields obj
        filedsValue = fields.val(); // Input fields value
        filedsLabel = fields.attr('label'); // Input related label
        filedsRule = fields.attr('rule'); // Validation rule

        // console.log(filedsRule);
        // console.log(typeof(filedsRule));

        // 1. If contain class 'must', the value can't null
        if (fields.hasClass('must') && filedsValue === '') {
            // show_msg(filedsLabel + " 不能为空!", 'warning');
            alert(filedsLabel + " 不能为空!");
            return true;
        }
        // 2. If not null, then validation rule
        if (filedsValue !== '' && filedsRule !== undefined && filedsRule !== '') {
            var re = validateRule[filedsRule]['rule'];
            if (re.test(filedsValue)) {
                // show_msg(filedsLabel + validateRule[filedsRule]['msg'], 'warning');
                alert(filedsLabel + validateRule[filedsRule]['msg']);
                return true;
            }
        }
    }
    return false;
}

/**
 * Validation rule, the rule default is not matching
 * @rule  regular expression
 * @msg  Error message
 */
var validateRule = {
    // just allow chinese or english
    'chEn': {'rule': /[^A-Za-z\u4e00-\u9fa5]/, msg: "只能是汉字或英文字母，注意是否输入了空格"},
    // Sequence, save in database with tinyint format, must <= 127
    'seq': {'rule': /[^0-9]/, msg: "只能是数字，注意是否输入了空格"}
};


// ajax 图片上传
/**
 * ajax文件上传
 * @param file 文件对象， document.getElementById('file')[0];
 * @param url  后台请求api处理的url地址  '/uploadImg'
 * @param successFunc  ajax上传执完成后的回调函数
 * @param customFileName  自定义文件名，用于后端将上传的文件rename， 可不填
 */
function fileUpload_ajax(file, url, successFunc, customFileName) {
    // 无法修改file的属性, 只读
    // file.f = '1.gif';
    // console.log(file);
    var formData = new FormData();
    formData.append("file", file);
    formData.append("customFileName", customFileName);
    // var tempData = {
    //     "action": "uploadImg",
    //     "file":formData
    // };
    // 开始上传   文件类型的格式，不能转json字符串，没有用封装的函数
    // ajax_request('POST', '/zj_officer_management', 'uploadImg', {'file': file}, function() {
    // });
    // console.log(tempData);
    // 如果是ajax传输文件, 要是FormData()类型  否则错误TypeError: Can only call Blob.slice on instances of Blob
    // It has to be a formData, if you are sending a file. https://developer.mozilla.org/en-US/docs/Web/API/FormData

    //  processData: false, 否则错误 ajax TypeError: Not enough arguments
    $.ajax({
        type: 'POST',
        url: url,
        processData: false,
        // dataType: "json",                   // 这里为了规范将传给服务器和要求服务器换回的数据都要求是json
        // 为什么要注释，当涉及到渲染模板传回来的html数据，用来刷新页面时(如showTables)，会出错，非json格式
        // contentType: "application/json",    // 如果指定了该值，POST请求是只能传入json字符串，GET传js对象即可
        data: formData,
        async: false,cache: false, contentType: false,  // 没有这行会报错, 有时间需要研究
        success: function (jsonData) {
            // 修改图片
            var rnd = Math.floor(Math.random()*10);  // 加上随机数，防止图片内容改变但路径不变时图片不刷新
            // alert(rnd);
            // 清空文件选中状态，防止change事件不触发
            // $('input[type="file"]').val('');   // 暂时不需要
            successFunc(jsonData, rnd);
            // imgObj.attr('src', jsonData.filePath+"?rnd="+rnd);
        },
        error: function (err) {
            console.log("/************* Error_start *************/");
            console.log("'" + requestType + "请求" + url + " action:" + action + " 发生了错误!'");
            console.log(err);
            console.log("/************* Error_end *************/");
        }
    });
}


/**
 * 获取checkbox选中，返回选中的 ID 数组
 * @param isCustom 是否是自定义的处理，通用是获取editId，如果传了该值，表示是特殊处理的
 */
function getCheckboxData(isCustom) {
    var idsOBJ = $('[name="cbCustom"]:checked');
    var ids = [];
    for (var i = 0; i < idsOBJ.length; i++) {
        if (isCustom === undefined) { // 正常情况下
            ids.push($(idsOBJ[i]).attr('editId'));
        } else { // 非正常情况，特殊考虑
            switch (isCustom) {
                case 'fabricManagement':
                    ids.push({FabricID:$(idsOBJ[i]).attr('FabricID'),ImgName:$(idsOBJ[i]).attr('ImgName')});
                    break;
            }
        }
    }
    // console.log(ids);
    return ids;
}

/**
 * 监听全选按钮，checkbox的全选，与非全选
 * 一般的checkbox name值指定为cbCustom, 全选checkbox name值指定为是cbCustomMain
 * attr该prop，点第一次可以，多点几次失效 http://blog.csdn.net/u012124564/article/details/47837615
 */
$bodyObj.on('change', '[name="cbCustomMain"]', function (e) {
    var otherCb = $('[name="cbCustom"]');
    $(this).is(':checked') ? otherCb.prop('checked', true) : otherCb.prop('checked', false);
});



// 通用选择文件后的文件预览
function filePreview(file, previewDivId, callback) {
    var prevDiv = document.getElementById(previewDivId);
    if (file.files && file.files[0]) {
        var reader = new FileReader();
        reader.onload = function(evt) {
            prevDiv.innerHTML = '<img src="' + evt.target.result + '" />';
        };
        reader.readAsDataURL(file.files[0]);
    } else {
        prevDiv.innerHTML = '<div class="img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + file.value + '\')"></div>';
    }

    // 注意异步，这里会在图片刷出来之前执行
    if (callback !== undefined && typeof(callback) === 'function') {
        callback();
    }
}
