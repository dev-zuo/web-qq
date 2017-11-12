
/**
 * 各个模块事件的监听处理
 * Created by kevin on 2017/11/12.
 */

var $bodyObj = $('body');

var loginM = new LoginM();

$bodyObj.on('mouseover mouseout', '.loginM-p1-top-right img', loginM.qrcodeHover);
$bodyObj.on('input propertychange', '.loginM-p1-form-main-div2 input', loginM.enableBtn);

function LoginM() {
    var that = this;
    var api = '/loginM';

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
        var pwValue = $(this).val();
        if (pwValue === "") {
            $('.loginM-p1-form-main-div2 img').attr('src', '/public/images/login_submit.png');
        } else {
            $('.loginM-p1-form-main-div2 img').attr('src', '/public/images/login_submit_hover.png');
        }
    };
}
