import URLType from './url'

export default {

    //封装ajax
    fetch(data, callback) {

        if(data.callback){
            callback = data.callback;
        }

        if (!callback) {
            callback = function () {}
        }

        if (!data) {
            return;
        }

        let url = this.getUrlByType(data),
            that = this;

        data.url = url;
        //删除对象上的数据
        delete data.outerData;
        delete data.URLType;

        data.success = function (data, text, res) {


            //401
            if (res.status == 401) {
                window.location.href = "https://" + App.Config.UrlConf.accountURL + "/login";
                return false;
            }

            if (typeof (data) == "string") {
                // to json
                if (JSON && JSON.parse) {
                    data = JSON.parse(data);
                } else {
                    data = $.parseJSON(data);
                }
            }

            //未登录
            if (data.code == 10004) {
                window.location.href = data.data;
                return false;
            }


            if (data.code != 0 && data.code != undefined) {
                //console.log(data.message);
            }


            if ($.isFunction(callback)) {
                if (data.code == 0 || data.code == undefined || data.code == 'success' || data.code == 1000) { // data.features 地图信息
                    //回调
                    callback(data);
                } else {
                    callback(data);
                    App.logger(data.message);
                }
            }
        }

        data.error = function (rep) {

            callback(false, rep);

        }

        return $.ajax(data);

    },

    //post
    post(data, callback) {

        //数据转化
        data.headers = {
            "Content-Type": "application/json"
        }

        data.type = "POST";

        data.data = JSON.stringify(data.data);


        return this.fetch(data, callback);

    },

    //delete
    delete(data, callback) {

        data.type = "delete";
        //数据转化
        data.headers = {
            "Content-Type": "application/json"
        }
        data.data = JSON.stringify(data.data);
        return this.fetch(data, callback);

    },

    //put
    put(data, callback) {

        data.type = "put";
        //数据转化
        data.headers = {
            "Content-Type": "application/json"
        }
        data.data = JSON.stringify(data.data);
        return this.fetch(data, callback);

    },
    //上传接口 要分
    upload(data, callback) {

        if (!data) {
            return;
        }

        let url = this.getUrlByType(data),
            file = data.data.file,
            that = this;

        data.url = url;
        //删除对象上的数据
        delete data.outerData;
        delete data.URLType;

        var formdata = new FormData();
        formdata.append("fileName", file.name);
        formdata.append("size", file.size);
        formdata.append("file", file);

        return $.ajax({
            method: "post",
            url: url,
            processData: false,
            //必须false才会自动加上正确的Content-Type   
            contentType: false,
            data: formdata,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                //是否支持上传进度监听
                if (xhr.upload && typeof (xhr.upload.onprogress) == "object") {
                    //是否需要监听进度
                    if (data.progress) {
                        xhr.upload.addEventListener("progress", data.progress, false);
                    }
                }
                return xhr;
            }
        }).done(function (data) {

            //session 失效
            if (data.code == 401) {
                window.location.href = "https://" + App.Config.UrlConf.accountURL + "/login";
                return;
            }

            if (data.code != undefined && data.code != 0) {
                // console.log(data.message);
                return;
            }
            if (data.code != undefined && data.code != 0) {
                //console.log(data.message);
                return;
            }

            typeof (callback) == "function" && callback(data);

        });


    },

    //构建url
    getUrlByType: function (data) {

        //存在不用构建
        if (data.url) {
            return data.url;
        }

        let url = URLType.Settings.hostname + URLType.URL[data.URLType];

        //是否调试 URLType.Settings.debug
        if (!url) {
            url = URLType.DEBUGURL[data.URLType];
        }

        //没有调试接口
        if (!url) {
            alert(data.URLtype + " 未定义");
        }

        //url 是否有参数
        var urlPars = url.match(/\{([\s\S]+?(\}?)+)\}/g),
            outerData = data.data || {},
            temp = data.outerData || {};

        //string
        if ((typeof temp) == 'string') {
            temp = JSON.parse(temp);
        }
        if ((typeof outerData) == 'string') {
            outerData = JSON.parse(outerData);
        }

        if (temp.length) {
            data = {};
        }

        //赋值
        for (var key in outerData) {
            temp[key] = outerData[key];
        }


        if (urlPars) {
            for (var i = 0; i < urlPars.length; i++) {

                var rex = urlPars[i],
                    par = rex.replace(/[{|}]/g, ""),
                    val = temp[par];
                url = url.replace(rex, val);
            }
        }

        //请求 时间戳
        if (url.indexOf("?") > -1) {
            url += "&_t=" + (+new Date);
        } else {
            url += '?_t=' + (+new Date);
        }

        return url;
    }

}