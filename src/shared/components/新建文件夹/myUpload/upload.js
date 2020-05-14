 export default function BreakPointUpload(options) {

     if (!(this instanceof BreakPointUpload)) {
         return new BreakPointUpload(options);
     }

     var defaultOptions = {

         wsid: App.modules.util.workspaceId, //项目id

         parentId: "", //父节点id

         getFileUrl: "/document/upload/containers/{wsid}/appendfiles/?parentId={pid}&fileName={fileName}&length={length}",

         uploadUrl: '/document/upload/containers/{wsid}/appendfiles/{appendFileId}/data?position={position}&sliceSize={sliceSize}',

         getPosUrl: '/document/upload/containers/{wsid}/appendfiles/{appendfileId}',

         status: "unload", // unload 未开始  uploading 进行中  pause 暂停  reading 文件读取中

         binaryFile: null, //上传的文件

         size: 0,

         file: null, //上传的文件

         startPos: 0, //开始位置

         endPos: 0, //结束位置

         MaxSize: 5368709120, //最大5G

         blockSize: 3145728, //,https://api.glodon.com/p/https://api.glodon.com/p/, //单块5M

         appendfileId: false, //获取进度的id

         progress: null,

         AppendFileData: false, //上传标示

         successCallback: null, //成功回调

         failCallback: null //失败回调
     };

     this.Options = $.extend({}, defaultOptions, options);

     var wsid = this.Options.wsid;

     this.Options.getFileUrl = this.Options.getFileUrl.replace('{wsid}', wsid).replace('{pid}', this.Options.parentId);
     this.Options.uploadUrl = this.Options.uploadUrl.replace('{wsid}', wsid);
     this.Options.getPosUrl = this.Options.getPosUrl.replace('{wsid}', wsid);

     var file = this.Options.file;

     this.Options.size = this.Options.file.size;

     if (file.size > this.Options.MaxSize) {
         alert("文件大于5G");
         return;
     }

     //上传前文件处理   
     this.beforeUpload();

 }


 //失败了再次上传获取 
 BreakPointUpload.prototype.getFilePos = function() {

     if (!this.Options.appendfileId) {
         alert("无appendfileId");
         return;
     }

     var that = this;

     this.Options.getPosUrl = this.Options.getPosUrl.replace('{appendfileId}', this.Options.appendfileId);

     $.ajax({

         url: this.Options.getPosUrl,

         type: "GET"

     }).done(function(data) {

         if (data.code == 0) {

             that.Options.startPos = data.data.position;
         }

     }).fail(function(data) {
         console.log(data)
         if ($.isFunction(that.Options.failCallback)) {
             that.Options.failCallback(data);
         }
     });

 }

 //上传前文件处理   
 BreakPointUpload.prototype.beforeUpload = function() {

     var file = this.Options.file;

     var fileName = encodeURIComponent(file.name);
     
     if(this.Options.isSameFile){
        fileName = encodeURIComponent(this.Options.fileName);
     }

     this.Options.getFileUrl = this.Options.getFileUrl.replace('{fileName}', fileName).replace('{length}', file.size);

     //小于5M 直接上传
     if (this.Options.size <= this.Options.blockSize) {

         this.Options.endPos = this.Options.size;

     } else {

         this.Options.endPos = this.Options.blockSize;

     }

     this.readFileToBinary();


 }

 //获取标识
 BreakPointUpload.prototype.getAppendFile = function() {

     var that = this;

     $.ajax({
         url: this.Options.getFileUrl,
         type: "PUT"
     }).done(function(data) {

         var AppendFileData = that.Options.AppendFileData = data.data,

             file = that.Options.file;

         if (!AppendFileData) {
             console.log(data)
             if ($.isFunction(that.Options.failCallback)) {
                 that.Options.failCallback(data);
             }
             return;
         }

         //已经上传过的
         if (AppendFileData.position != 0) {

             that.Options.endPos = that.Options.startPos = AppendFileData.position;

             that.Options.endPos += that.Options.blockSize;

             if (that.Options.endPos > file.size) {

                 that.Options.endPos = file.size;
             }

             that.readFileToBinary();

         } else {

             that.continueUploadHttpRequest();
         }

     }).fail(function(data) {
         console.log(data)
         if ($.isFunction(that.Options.failCallback)) {
             that.Options.failCallback(data);
         }
     });
 } 


 //开始上传
 BreakPointUpload.prototype.continueUploadHttpRequest = function() {

     var url = this.Options.uploadUrl;

     url = url.replace('{appendFileId}', this.Options.AppendFileData.id).replace('{position}', this.Options.startPos).replace('{sliceSize}', this.Options.endPos - this.Options.startPos);


     this.Options.status = "uploading";

     var that = this,

         file = this.Options.file;


     var xhr = new XMLHttpRequest();

     xhr.open("POST", url);

     var progress = this.Options.progress;
     if ($.isFunction(progress)) {

         xhr.upload.onprogress = function(data) {

             progress({
                 total: that.Options.file.size,
                 loaded: that.Options.startPos
             });

         };
     }

     //xhr.overrideMimeType("application/octet-stream");
     xhr.setRequestHeader("Content-Type", "application/octet-stream");


     //直接发送二进制数据
     if (xhr.sendAsBinary) {
         xhr.sendAsBinary(that.Options.binaryFile);
     } else {
         xhr.send(that.Options.binaryFile);
     }

     // 监听变化
     xhr.onreadystatechange = function(e) {


         if (xhr.readyState === 4) {

             if (xhr.status === 200) {

                 var data = JSON.parse(e.target.responseText);

                 if (data.code == 0) {

                     if (that.Options.endPos < file.size) {

                         that.Options.startPos = that.Options.endPos;

                         that.Options.endPos += that.Options.blockSize;

                         if (that.Options.endPos > file.size) {

                             that.Options.endPos = file.size;
                         }

                         //暂停
                         if (that.Options.status == "pause") {
                             return;
                         }

                         that.readFileToBinary();

                     } else {

                         that.Options.status == "success"

                         if ($.isFunction(that.Options.successCallback)) {

                            that.getFileDetail(data.data.fileId);  
                         }

                     }

                 } else {

                     console.log(data)
                         //error
                     if ($.isFunction(that.Options.failCallback)) {
                         that.Options.failCallback(data);
                     }

                 }
             } else {
                 console.log(data)
                     //error
                 if ($.isFunction(that.Options.failCallback)) {
                     that.Options.failCallback(data);
                 }
             }
         }
     }
 }

 //获取文件详情
 BreakPointUpload.prototype.getFileDetail = function (id){

    var that = this;

    $.ajax({
        url:"https://"+App.Config.UrlConf.yunURL+"/document/id/file/"+id+"?meta",
        success:function(data){
            that.Options.successCallback(data.meta);
        }
    });
 }


 //开始
 BreakPointUpload.prototype.reStart = function() {

     this.readFileToBinary();

 }

 //读取文件
 BreakPointUpload.prototype.readFileToBinary = function() {

    //暂停
     if (this.Options.status == "pause") {
         return;
     } 

     this.Options.status = "reading";

     var file = this.Options.file,

         blobFile = file.slice(this.Options.startPos, this.Options.endPos),

         reader = new FileReader(),

         that = this;



     reader.onload = function(e) {



         //读取到的二进制文件
         that.Options.binaryFile = e.target.result;

         //第一次上传
         if (!that.Options.AppendFileData) {
             that.getAppendFile();
         } else {
             //续传
             that.continueUploadHttpRequest();
         }

     }

     reader.readAsArrayBuffer(blobFile); //readAsBinaryString readAsArrayBuffer
 }