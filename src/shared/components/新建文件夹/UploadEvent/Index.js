;
(function () {

    var key = 1;

    $.fn.UploadEvent = function (opts) {
        return new UploadQuere($(this), opts);
    };



    var UploadQuere = function ($el, ops) {

        App.isBreakPoint = true;

        //必须实例
        if (!(this instanceof UploadQuere)) {
            return new UploadQuere(ops);
        }


        var defaultOpts = {

            wsid: "", //项目id 

            isMulti: false,

            btnId: null, //上传的id

            isUploadFolder: true,

            isDrop: true, //是否允许拖拽上传

            filter: null, //过滤是否可以上传

            blockSize: 5242880, //如果分片 单片大小 b 1m  1048576

            MaxSize: 5368709120, //分片最大支持5G

            normalSize: 104857600, //超过 开始分片  

            fDisable: null, //是否上传

            fBottomTip: null, //底部提示

            canUploadFile: null, //是否可以上传

            getUploadUrl: null, //获取上传url

            fSuccess: null, //成功回调

            fError: null //失败回调
        }


        this.Options = $.extend(defaultOpts, ops);

        var id = "#" + $el.attr("id");

        if (!this.Options.btnId) {
            this.Options.btnId = id;
        }

        //可以上传文件夹判断是否是ie ie不可上传文件夹
        if (this.Options.isUploadFolder) {
            this.Options.isUploadFolder = !this.isIE();
        }

        //上传总数 上传成功
        this.Options.uploadCount = 0;
        this.Options.upLoadSuccess = 0;
        this.Options.upLoadFail = 0;
        //状态
        this.Options.status = "wait";

        //全部重新上传
        this.Options.isReUploadAll = false;

        this.uploadNubmer = +new Date();
        this.UploadFileList = {

        };

        this.UploadFileArr = [];

        this.init();

    }

    //是否是ie
    UploadQuere.prototype.isIE = function () {

        var userAgent = navigator.userAgent;
        var isOpera = userAgent.indexOf("Opera") > -1;

        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return true;
        } else {
            return false;
        }
    }


    //初始化
    UploadQuere.prototype.init = function () {
        this.initHTML();
        this.Options.btnId && this.btnEvent();
    }



    //初始化html
    UploadQuere.prototype.initHTML = function () {

        this.Options.uploadId = "upload_" + (+new Date()) + key;
        key++;

        if (this.Options.type && this.Options.type == "pic") {
            $("body").append('<input accept="image/*" id="' + this.Options.uploadId + '" type="file" class="txtUpload" ' + (this.Options.isMulti ? 'multiple' : '') + '/>');
        } else {
            $("body").append('<input id="' + this.Options.uploadId + '" type="file" class="txtUpload" ' + (this.Options.isMulti ? 'multiple' : '') + '/>');
        }

    }

    UploadQuere.prototype.removeFile = function (id) {

        delete this.UploadFileList[id];

        this.UploadFileArr.splice(this.UploadFileArr.indexOf(id), 1);
    }

    UploadQuere.prototype.reUploadAll = function (ids) {

        for (var i = 0; i < ids.length; i++) {
            this.UploadFileArr.push(ids[i]);
        }
        this.Options.isReUploadAll = true;
        this.start();
    }

    //取消当前的 下一个
    UploadQuere.prototype.CanelUpload = function (currentUploadId) {
        var that = this;
        //取消上传
        if (that.BreakUploadObj) {
            that.BreakUploadObj.Options.status = "pause";
        }

        //取消的是正在上传的
        if (currentUploadId == this.Options.currentUploadId) {
            that.Options.status = "wait";
            that.Options.ReqAjax && that.Options.ReqAjax.abort();
        } else {
            //没有上传的删除队列中的数据
            var index = this.UploadFileArr.indexOf(currentUploadId);
            this.UploadFileArr.splice(index, 1);
        }

    }

    //按钮点击事件
    UploadQuere.prototype.btnEvent = function () {

        var that = this,
            Options = this.Options;

        //选择上传还是直接上传
        $(Options.btnId).on("click.uploadzp", function () {

            //上传回调
            if (Options.canUploadFile) {

                var result = Options.canUploadFile(Options.uploadId);
                if (!result) {
                    return;
                }
            }

            $("#" + Options.uploadId).click();

        });

        //上传单个文件
        $("#" + Options.uploadId).change(function () {
            that.add(this.files);
        });
    }

    //添加
    UploadQuere.prototype.add = function (files) {

        var timer = false,
            that = this;

        function triUp() {

            timer && clearTimeout(timer);

            if ( window.App && App.FormVail && $.isFunction(App.FormVail.saveDraftAfter)) {

                timer = setTimeout(function () {
                    triUp();
                }, 500);

            } else {

                that.addComm(files);

                $("#" + that.Options.uploadId).val("");

            }
        }

        triUp();
    }


    //添加上传文件
    UploadQuere.prototype.addComm = function (files) {

        var isUpload = true,
            canUploadFile = this.Options.canUploadFile;

        if ($.isFunction(canUploadFile)) {
            isUpload = canUploadFile();
        }

        if (!isUpload) {
            return;
        }


        var len = files.length,
            paralHtml = "",
            file,
            uplodItemId,
            fAdd = this.Options.fAdd;

        for (var i = 0; i < len; i++) {

            file = files[i];

            //0kb 不上传
            if (file.size == 0) {
                //continue;
            }

            uplodItemId = "uplodItemId_" + (+new Date()) + key;

            key++;

            //this.uploadNubmer += 1;

            this.UploadFileList[uplodItemId] = {};

            this.UploadFileList[uplodItemId].file = file;


            if (!$.isFunction(this.Options.getUploadUrl)) {
                alert("未定义getUploadUrl方法");
                return;
            }

            var url = this.Options.getUploadUrl();

            var params = false;

            if (typeof (url) != "string") {
                params = url.params;
                url = url.url; 
            }

            if (!url) {
                return;
            }

            this.UploadFileList[uplodItemId].uploadUrl = url;

            this.UploadFileList[uplodItemId].params = params;

            this.UploadFileList[uplodItemId].size = this.formatSize(file.size);

            this.UploadFileList[uplodItemId].key = uplodItemId;

            this.UploadFileArr.push(uplodItemId);

            this.Options.uploadCount += 1;

            fAdd && fAdd(this.UploadFileList[uplodItemId]);
        }

        // this.Options.upLoadSuccess   this.Options.uploadCount  

        if (this.Options.status == "wait") {
            this.start();
        }

    }

    //格式化大小
    UploadQuere.prototype.formatSize = function (value) {
        if (null == value || value == '') {
            return "0 Bytes";
        }
        var unitArr = new Array("b", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
        var index = 0;
        var srcsize = parseFloat(value);
        index = Math.floor(Math.log(srcsize) / Math.log(1024));
        var size = srcsize / Math.pow(1024, index);
        size = size.toFixed(2); //保留的小数位数
        return size + unitArr[index];
    }



    UploadQuere.prototype.start = function (fileId) {

        if (this.Options.status != "wait") {
            return;
        }

        var Options = this.Options;

        if (fileId) {

            Options.currentUploadId = fileId;

        } else if (this.UploadFileArr.length > 0) {
            //去除第一个
            Options.currentUploadId = this.UploadFileArr.shift();
        } else {

            this.uploadEnd();
            return;
        }

        var uploadFileObj = this.UploadFileList[this.Options.currentUploadId]; 

        var file = uploadFileObj.file,

            that = this,

            data = {

                url: uploadFileObj.uploadUrl,

                params: uploadFileObj.params,

                file: file,

                blockSize: this.Options.blockSize,

                progress: function (data) {
                    data.fileId = that.Options.currentUploadId;
                    that.progress(data);
                },

                successCallback: function (data) {
                    that.success(data);
                },

                failCallback: function (data) {
                    that.fail(data);
                }
            };


        if (file.size <= 0) {
            this.fail();
            return;
        }

        //正常上传
        this.uploadNormal(data);

        this.Options.status = "uploading";
    }

    //上传结束
    UploadQuere.prototype.uploadEnd = function () {

        this.Options.isReUploadAll = false;

    }

    UploadQuere.prototype.progress = function (data) {

        var loaded = data.loaded,
            tot = data.total,
            per = Math.floor(100 * loaded / tot);

        if (isNaN(per)) {
            return;
        }

        if(per == 100) {
            per = 99
        }

        this.Options.progress && this.Options.progress({
            key: this.Options.currentUploadId,
            pre: per + "%"
        });

    }

    UploadQuere.prototype.success = function (data) {
        
        if(typeof data == 'string') {
            try {
                data = JSON.parse(data)
            } catch (error) {}
        }


        this.Options.upLoadSuccess += 1;

        this.BreakUploadObj = false;

        var fSuccess = this.Options.fSuccess;
        data.key = this.Options.currentUploadId;
        $.isFunction(fSuccess) && this.UploadFileList[this.Options.currentUploadId] && fSuccess(data);

        this.Options.status = "wait";

        this.start();
    }

    UploadQuere.prototype.fail = function () {

        //取消上传了
        if (!this.UploadFileList[this.Options.currentUploadId]) {
            return;
        }

        //取消算失败 不算上传失败
        this.Options.upLoadFail += 1;

        this.UploadFileList[this.Options.currentUploadId].status = "fail";

        //失败回掉
        var fError = this.Options.fError;

        $.isFunction(fError) && fError({
            key: this.Options.currentUploadId
        });

        this.Options.status = "wait";
        this.start();
    }


    //正常上传
    UploadQuere.prototype.uploadNormal = function (data) {

        var url = data.url,
            file = data.file,
            that = this;

        var formdata = new FormData();
        formdata.append("fileName", file.pasteName || file.webkitRelativePath || file.fullPath || file.name);
        formdata.append("size", file.size);
        formdata.append("file", file); 
         
        //额外参数
        if (data.params) {
            for (var key in data.params) {
                formdata.append(key, data.params[key]);
            }
        }

        this.Options.ReqAjax = $.ajax({
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
        }).done(function (resp) {
            //session 失效
            if (resp.code == 401) {
                window.location.href = "https://" + App.Config.UrlConf.accountURL + "/login";
                return;
            }

            if (resp.code != undefined && resp.code != 0) {
                console.log(resp.message);
                data.failCallback(resp);
                return;
            }

            if (data.successCallback) {
                data.successCallback(resp);
            }

        }).fail(function (resp) {
            //失败
            if (data.failCallback) {
                data.failCallback(resp);
            }
        });
    }

    UploadQuere.prototype.destroy = function () {

        var that = this,
            Options = this.Options;

        that.UploadFileArr.length = 0;
        that.UploadFileList = {};
        if (that.BreakUploadObj) {
            that.BreakUploadObj.Options.status = "pause";
        }

        $(Options.btnId).off("click.uploadzp");

        Options.uploadCount = 0;
        Options.upLoadSuccess = 0;
        Options.upLoadFail = 0;

        Options.ReqAjax && that.Options.ReqAjax.abort();
        //等待上传
        Options.status = "wait";

    }

})();