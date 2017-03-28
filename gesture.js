/**
 * Created by shizhan on 17/3/25.
 */
var INIT_R = 30,//初始九键的半径
    CHECK_R = 10,//选中键的半径
    re = [],//保存九键的状态
    last_X = -1,//上一次绘制的键的x坐标
    last_Y = -1,//上一次绘制的键的y坐标
    lines = [],//已经被选中的键
    pwd = [],//密码，键对应的数字0-8
    color = "#7bbfea",//画笔颜色初始化
    count = 0,//设置密码时的输入次数
    oldPwd = "";//设置密码时第一次的输入

var setting = $("setting"),//设置密码radio
    hint = $('hint'),//提示信息
    drawing1 = $("drawing1"),//画布1
    drawing2 = $("drawing2"),//画布2
    ops = $("ops"),//操作radio
    ctx1,//画布1context
    ctx2;//画布2context

function $(id) {
    return document.getElementById(id);
}
//绘制小画布初始九键
function drawInitSubCircle() {
    //画布1
    ctx1.beginPath();
    for (var i = 5; i <= 25; i += 10) {
        for (var j = 5; j <= 25; j += 10) {
            ctx1.moveTo(j + INIT_R / 10, i);
            ctx1.arc(j, i, INIT_R / 10, 0, 2 * Math.PI, false);
        }
    }
    ctx1.lineWidth = 0.25;
    ctx1.strokeStyle = "#666";
    ctx1.stroke();
    ctx1.closePath();
}
//绘制初始九键
function drawInitCircle() {
    //画布2
    ctx2.beginPath();
    for (var i = 50; i <= 250; i += 100) {
        for (var j = 50; j <= 250; j += 100) {
            ctx2.moveTo(j + INIT_R, i);
            ctx2.arc(j, i, INIT_R, 0, 2 * Math.PI, false);
        }
    }
    ctx2.lineWidth = 1.0;
    ctx2.strokeStyle = "#ccc";
    ctx2.stroke();
    ctx2.closePath();
}
//画选择状态的键
function drawCheckedCircle(x, y) {
    // 画实心内部圆
    ctx2.beginPath();
    ctx2.moveTo(x + CHECK_R, y);
    ctx2.arc(x, y, CHECK_R, 0, 2 * Math.PI, false);
    ctx2.fillStyle = color;
    ctx2.fill();
    //画中空外部圆
    ctx2.beginPath();
    ctx2.moveTo(x + INIT_R, y);
    ctx2.arc(x, y, INIT_R, 0, 2 * Math.PI, false);
    ctx2.lineWidth = 2.0;
    ctx2.strokeStyle = color;
    ctx2.stroke();
    ctx2.closePath();
}
//在小画布中绘制选中的键
function drawSubCircle(x, y) {
    // 画实心内部圆
    ctx1.beginPath();
    ctx1.moveTo(x + INIT_R / 10, y);
    ctx1.arc(x, y, INIT_R / 10, 0, 2 * Math.PI, false);
    ctx1.fillStyle = color;
    ctx1.fill();
}
//画两个键之间的线
function drawLine(last_X, last_Y, x, y) {
    ctx2.beginPath();
    ctx2.moveTo(last_X, last_Y);
    ctx2.lineTo(x, y);
    ctx2.lineWidth = 2.0;
    ctx2.strokeStyle = color;
    ctx2.stroke();
}
//画保存的轨迹
function drawRecords() {
    for (var i = 0; i < lines.length; i++) {
        if (i != 0) {
            drawLine(lines[i - 1].x, lines[i - 1].y, lines[i].x, lines[i].y);
        }
        drawCheckedCircle(lines[i].x, lines[i].y);
    }
}
//在小画布中绘制轨迹
function drawSubRecords() {
    for (var i = 0; i < lines.length; i++) {
        // console.log(lines[i].x / 10 + "," + lines[i].y / 10);
        drawSubCircle(lines[i].x / 10, lines[i].y / 10);
    }
}
//刷新画布
function updateCan() {
    //清除画布
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    //画初始9键
    drawInitCircle();
    //画保存的轨迹
    drawRecords();
}
//清除记录
function clear() {
    for (var i = 0; i < 9; i++)
        re[i] = false;
    lines = [];
    pwd = [];
    last_X = -1;
    last_Y = -1;
    color = "#7bbfea";
}
function getCircle(x, y) {
    var distance;
    var id, t_x, t_y;
    if (x < 100) {
        t_x = 50;
        if (y < 100) {
            t_y = 50;
            id = 0;
        } else if (y > 100 && y < 200) {
            t_y = 150;
            id = 3;
        } else {
            t_y = 250;
            id = 6
        }
    } else if (x > 100 && x < 200) {
        t_x = 150;
        if (y < 100) {
            t_y = 50;
            id = 1;
        } else if (y > 100 && y < 200) {
            t_y = 150;
            id = 4;
        } else {
            t_y = 250;
            id = 7;
        }
    } else {
        t_x = 250;
        if (y < 100) {
            t_y = 50;
            id = 2;
        } else if (y > 100 && y < 200) {
            t_y = 150;
            id = 5;
        } else {
            t_y = 250;
            id = 8;
        }
    }
    distance = Math.pow(x - t_x, 2) + Math.pow(y - t_y, 2);
    if (distance <= Math.pow(INIT_R + 5, 2))
        return {id: id, x: t_x, y: t_y};
    else return null;
}
function callback(e) {
    // console.log(e.target.nodeName.toLowerCase());
    if (e.target.value == "validate" || e.target.firstChild.nodeValue == "验证密码") {
        drawing1.style.display = "none";
    } else
        drawing1.style.display = "block";
}
//自定义tap事件
function tap(dom, callback) {
    var startTime = 0,
        delayTime = 200,
        isMove = false;
    dom.addEventListener("touchstart", function (e) {
        startTime = Date.now();
    });
    dom.addEventListener("touchmove", function (e) {
        isMove = true;
    });
    dom.addEventListener("touchend", function (e) {
        if (isMove)
            return;
        if (Date.now() - startTime > delayTime)
            return;
        callback(e);
    });
}
function init() {
    if (drawing2.getContext) {
        ctx1 = drawing1.getContext("2d");
        ctx2 = drawing2.getContext("2d");
    }
    var bcr = drawing2.getBoundingClientRect();
    localStorage.setItem("gesturePwd", "");
    for (var i = 0; i < 9; i++)
        re[i] = false;
    drawInitSubCircle();
    drawInitCircle();

    //触摸监听事件
    drawing2.addEventListener("touchend", function () {
            updateCan();
            var newPwd = pwd.join(",");//当前输入的密码
            if (setting.checked) {
                if (count == 0) {//首次输入
                    if (lines.length < 5) {
                        hint.innerHTML = "<div>密码太短，最少5位，请重新输入</div>";
                        color = "#f3715c";
                    } else {
                        oldPwd = newPwd;//设置新的密码
                        hint.innerHTML = "<div>请再次输入手势密码</div>";
                        color = "#7bbfea";
                        count = 1;
                        //绘制小画布中的轨迹
                        drawSubRecords();
                    }
                } else {//再次输入
                    if (oldPwd === newPwd) {
                        localStorage.setItem("gesturePwd", oldPwd);
                        hint.innerHTML = "<div>设置成功！</div>";
                        color = "#a3cf62";
                        setTimeout(function () {
                            //清除画布
                            ctx1.clearRect(0, 0, ctx1.canvas.width, ctx1.canvas.height);
                            //画初始9键
                            drawInitSubCircle();
                        }, 800);
                    } else {
                        hint.innerHTML = "<div>与上一次输入不一致，请重新设置</div>";
                        color = "#7bbfea";
                        oldPwd = "";
                        //清除画布
                        ctx1.clearRect(0, 0, ctx1.canvas.width, ctx1.canvas.height);
                        //画初始9键
                        drawInitSubCircle();
                    }
                    count = 0;
                }
            } else {
                var curPwd = localStorage.getItem("gesturePwd");
                if (curPwd === newPwd) {
                    hint.innerHTML = "<div>密码正确！</div>";
                    color = "#a3cf62";
                }
                else {
                    hint.innerHTML = "<div>输入的密码不正确</div>";
                    color = "#f3715c";
                }
            }
            //重新绘制轨迹
            updateCan();
            setTimeout(function () {
                //清除画布
                ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
                //画初始9键
                drawInitCircle();
                clear();
            }, 800);
        }
    );
    drawing2.addEventListener("touchmove", function (e) {
        e.preventDefault();
        //得到canvas中的坐标位置
        var x = (e.touches[0].clientX - bcr.left) * (drawing2.width / bcr.width);
        var y = (e.touches[0].clientY - bcr.top) * (drawing2.height / bcr.height);
        var circle = getCircle(x, y);// 得到最靠近当前手指位置的键的圆心坐标
        if (circle != null) {//手指位置在键内
            if (re[circle.id] == false) {//该键没有选中过
                //绘制选中键的图案
                drawCheckedCircle(circle.x, circle.y);
                re[circle.id] = true;
                pwd.push(circle.id);
                last_X = circle.x;
                last_Y = circle.y;
                //保存这条轨迹
                lines.push({x: circle.x, y: circle.y});
            }
        }
        if (last_X !== -1 && last_Y !== -1) {//线开始位置不为空
            updateCan();
            //画一条从上个固定键到当前键的线
            drawLine(last_X, last_Y, x, y);
        }
    });
    tap(ops, callback);
}
init();
