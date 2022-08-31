'use strict';
window.onload = function() {
    init();
}

var Info = {
    scutInfo: [ // 个人信息
        { label: "姓名", value: "-" },
        { label: "学号", value: "-" },
        { label: "学院", value: "-" },
        { label: "年级", value: "-" },
        { label: "人员类型", value: "-" }
    ],
    stepBox: [ // 步骤栏
        { "name": "提交", "url": "img/unTrue.png" },
        { "name": "院级审批", "url": "img/unTrue.png" },
        { "name": "校级审批", "url": "img/unTrue.png" }
    ]
}

function getDate() { // 获取当前日期 YYYY/MM/DD
    const date = new Date();
    return date.toISOString().substring(0,10);
}

function getQuery(param) { // 获取URL参数
    var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)");
    var r = window.location.search.substring(1).match(reg);
    if (r === null) { return null; }
    return decodeURI(r[2]);
}

function getStuData(stuCode) { // 获取学生信息
    var stuData = null;
    let $ = layui.jquery;
    if (stuCode !== '') { // 已指定学号
        stuData = $.getJSON({
            async: false,
            url: "api/jailbreak/student/" + stuCode
        });
    }
    if (stuData === null || stuData.responseJSON['status'] === 'failed') {
        stuData = $.getJSON({
            async: false,
            url: 'api/jailbreak/student/'
        });
    }
    return stuData.responseJSON['data'];
}

function getQueryParams() { // 获取Query字段中预设值
    return {
        'start': getQuery('start'),
        'end': getQuery('end'),
        'addr': getQuery('addr'),
        'reason': getQuery('reason'),
        'name': getQuery('name'),
        'code': getQuery('code'),
        'college': getQuery('college'),
        'grade': getQuery('grade'),
        'degree': getQuery('degree'),
    }
}

function loadInfo() { // 载入填充信息
    let info = {};
    let $ = layui.jquery;
    var customInfo = getQueryParams();
    var randomInfo = getStuData(location.hash.replace('#', ''));
    var autoInfo = {
        'start': getDate(),
        'end': getDate(),
        'addr': randomInfo['addr'],
        'reason': randomInfo['reason'],
        'name': randomInfo['name'],
        'code': randomInfo['id'],
        'college': randomInfo['college'],
        'grade': '2019',
        'degree': '本科生',
    }
    $.each(customInfo, (index, item) => {
        info[index] = item === null ? autoInfo[index] : item;
    })
    return info;
}

function fillStepBox() { // 渲染进度栏
    layui.use(['jquery'], function() {
        let $ = layui.jquery;
        let htmlContent = '';
        $.each(Info.stepBox, (index, item) => {
            let lineContent = '';
            index != Info.stepBox.length - 1 ? lineContent = 'line' : '';
            htmlContent += '<div class="step '+ lineContent +'"><img src="'+ item.url +'"><span>'+ item.name +'</span></div>'
        });
        $('.step_box').empty();
        $('.step_box').html(htmlContent);
    });
}

function fillScutInfo() { // 显示审批通过
    layui.use(['form', 'jquery'], function() {
        let $ = layui.jquery;
        Info.stepBox[0].url = "img/true.png";
        Info.stepBox[1].url = "img/true.png";
        Info.stepBox[2].url = "img/true.png";

        let htmlContent = '';
        $('.info_box').empty();
        $.each(Info.scutInfo, (_index, item) => {
            htmlContent += '<div class="info_list"><span>' + item.label + '</span><span>' + item.value + '</span></div>';
        })
        $('.info_box').html(htmlContent);

        fillStepBox();
        $('.mask').show();
        $('.btn_add').hide();
        $('.logo_box').show();
        $('.info_input').hide();
        $('.logo_box img').attr('src', 'img/pass.png');
    });
}

function init() {
    layui.use(['jquery'], function() {
        let $ = layui.jquery;
        let info = loadInfo();
        console.log(info);

        Info.scutInfo[0].value = info.name;
        Info.scutInfo[1].value = info.code;
        Info.scutInfo[2].value = info.college;
        Info.scutInfo[3].value = info.grade;
        Info.scutInfo[4].value = info.degree;

        $(".dOutStartDate").text(info.start);
        $(".dOutEndDate").text(info.end);
        $("#reason").text(info.reason);
        $("#addr").val(info.addr);

        $("input[name$='scutName']").val(info.name);
        $("input[name$='scutCode']").val(info.code);
        $("input[name$='scutCollege']").val(info.college);
        $("input[name$='scutGrade']").val(info.grade);
        $("input[name$='scutDegree']").val(info.degree);

        fillStepBox();
        datePickerFunc.initDatePicker();
        if (getQuery('show') === 'true') {
            fillScutInfo();
        }
    });
}

function subFunc() {
    let $ = layui.jquery;
    let formData = layui.form.val("info_form");
    var info = {
        'start': $(".dOutStartDate").text(),
        'end': $(".dOutEndDate").text(),
        'addr': formData['sOutAddress'],
        'reason': formData['sOutReason'],
        'name': formData['scutName'],
        'code': formData['scutCode'],
        'college': formData['scutCollege'],
        'grade': formData['scutGrade'],
        'degree': formData['scutDegree'],
    }
    let query = '?show=true&';
    $.each(info, (index, item) => {
        query += index + '=' + item + '&'
    })
    query = query.substring(0, query.length - 1);
    window.location.href = '/' + query;
}

var datePickerFunc = {
    initDatePicker() { // 初始化日期控件
        datePickerFunc.datePickerBindChange("dOutStartDate"); // 开始日期
        datePickerFunc.datePickerBindChange("dOutEndDate"); // 结束日期
    },
    datePickerBindChange(value) { // 日期组件事件绑定
        layui.use([], function() {
            let $ = layui.jquery;
            $('#' + value).on('click', function() {
                weui.datePicker({
                    start: 1990,
                    end: new Date().getFullYear() + 1,
                    onConfirm: function(result) {
                        var mm = '', dd = '';
                        result[1].value.toString().length === 1 ? mm = '0' + result[1].value : mm = result[1].value;
                        result[2].value.toString().length === 1 ? dd = '0' + result[2].value : dd = result[2].value;
                        $('.' + value).text(result[0].value + '-' + mm + '-' + dd);
                    },
                    title: '日期'
                });
            });
        });
    }
}
