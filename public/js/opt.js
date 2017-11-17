
/**
 * 各个模块事件的监听处理
 * Created by kevin on 2017/11/12.
 */

var loginM = new LoginM();

// 二维码切换
$bodyObj.on('mouseover mouseout', '.loginM-p1-top-right img', loginM.qrcodeHover);
// submit按钮切换
$bodyObj.on('input propertychange', '.loginM-p1-form-main-div2 input', loginM.enableBtn);
// 用户名值改变，pw框清空
$bodyObj.on('input propertychange', '.loginM-p1-form-main-div1 input', loginM.clearPw);
// 登录状态切换
$bodyObj.on('click', '.loginM-p1-img-status', loginM.statusChange);
// 隐藏或显示下部面板
$bodyObj.on('click', '.loginM-p1-push', loginM.switchPanel);
// 登录
$bodyObj.on('click', '.loginM-p1-form-main-div2 img', loginM.submit);

function LoginM() {
    var that = this;
    this.api = '/loginM';
    this.isPwOk = false;

    // 登录界面二维码
    this.qrcodeHover = function () {
        var src = $(this).attr('src');
        var norSrc = "/public/images/login_qrcode.png";
        var hoverSrc = "/public/images/login_qrcode_hover.png";
        var curSrc = (src === norSrc)?hoverSrc:norSrc;

        $(this).attr('src', curSrc);
    };

    // 密码输入框，输入后，机会登录按钮
    this.enableBtn = function () {
        var pw = $('.loginM-p1-form-main-div2 input'); // 密码
        var un = $('.loginM-p1-form-main-div1 input'); //  用户名
        var btn = "/public/images/login_submit.png";
        var btnHover = "/public/images/login_submit_hover.png";
        var curBtn = (pw.val() === "" || un.val() === "")?btn:btnHover;
        that.isPwOk = (curBtn === btnHover);
        $('.loginM-p1-form-main-div2 img').attr('src', curBtn);
    };

    // 清除密码
    this.clearPw = function () {
        $('.loginM-p1-form-main-div2 input').val("");
        that.enableBtn();
    };

    // 登录状态切换
    this.statusChange = function () {
        var statusObj = $('.loginM-p1-img-status');
        var onlineColor = "rgb(0, 223, 50)";
        var hiddenColor = "rgb(255,199,91)";
        var oriColor = statusObj.css('background-color');
        var curColor = (oriColor === onlineColor)? hiddenColor:onlineColor;
        // alert(curColor + onlineColor + hiddenColor+oriColor);

        statusObj.css('background-color',curColor);
    };

    // 隐藏或显示下部面板
    this.switchPanel = function () {
        var p2Obj = $('.loginM-p2');
        var oriVal = p2Obj.css('bottom');
        var showVal = {
            "bottom": "0px",
            "bs": "0 3px 10px #aaa",
            "height": "392"
        };
        var hiddenVal = {
            "bottom": "75px",
            "bs": "none",
            "height": "315"
        };
        var curVal = (oriVal === showVal.bottom)?hiddenVal:showVal;

        // alert(oriVal+showVal+hiddenVal+curVal);
        p2Obj.css('bottom', curVal.bottom);
        p2Obj.css('box-shadow', curVal.bs);
        $('.loginM').css('height', curVal.height);
    };

    // 点击提交按钮
    this.submit = function () {
        // 测试用
        that.isPwOk = true;
        // 如果输入不全 that.isPwOk 为 undefined 或 false
        if(that.isPwOk) {
            // 开始验证密码是否正确
            var un = $('.loginM-p1-form-main-div1 input').val();
            var pw = $('.loginM-p1-form-main-div2 input').val();

            // 登录请求
            ajax_request('POST', that.api, 'login', {'un':un, 'pw':pw}, function (data) {
                $bodyObj.html(data);
            });
        }
    };
}
