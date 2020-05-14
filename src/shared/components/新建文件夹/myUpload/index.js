import BreakPointUpload from "./upload"

;
(function () {

	$.fn.myUpload = function (opts) {
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

			Offset: {
				x: 0,
				y: 0
			}, //上传文件夹的时候用到下拉选择 的 偏移量   

			btnId: null, //上传的id

			isSameFile: false, //是否是相同文件
			getFileName: false,
			fileName: "",

			isUploadFolder: true,

			isDrop: true, //是否允许拖拽上传

			filter: null, //过滤是否可以上传

			blockSize: 5242880, //如果分片 单片大小 b 1m  1048576

			MaxSize: 5368709120, //分片最大支持5G

			normalSize: 104857600, //超过 开始分片    

			fDisable: null, //是否上传

			fBottomTip: null, //底部提示

			getParentId: null,

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

		if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera || (!!window.ActiveXObject || "ActiveXObject" in window)) {
			return true;
		} else {
			return false;
		}
	}


	//初始化
	UploadQuere.prototype.init = function () {

		var isExists = this.initHTML();
		if (!isExists) {
			this.initEvent();
			this.initBottomTip();
		} else {
			//处理按钮选择的文件
			this.uploadChange();
			this.Options.btnId && this.btnEvent(true);
		}

	}

	//插件提示
	UploadQuere.prototype.initBottomTip = function () {

		var fBottomTip = this.Options.fBottomTip;

		if ($.isFunction(fBottomTip)) {
			this.Options.$uploadBox.find(".uploadTipSize").html(fBottomTip());
		}

	}

	//初始化html
	UploadQuere.prototype.initHTML = function () {

		var $uploadBox = $('<div class="uploadBox" />'),
			$uploadHeader = $('<div class="uploadHeader"/>'),
			$uploadContent = $('<div class="uploadContent"/>'),
			$uploadFooter = $('<div class="uploadFooter" />'),
			paralHtml = "";

		paralHtml += '<em class="uploadIconArrowUp imgClr"></em>';
		paralHtml += '<div class="uploadheaderTitle">';
		paralHtml += ' <span class="uploadStatusTitle">'+LAN.lan_1301101+'</span><span class="uploadCount"></span>';
		paralHtml += '<span class="uploadStatusProcess"></span> </div>';
		paralHtml += '<div class="uploadWindowOp">';
		paralHtml += '<span class="uploadWindowSize imgClr"></span><span class="uploadWindowClose imgClr"></span>';
		paralHtml += '</div>';
		$uploadHeader.html(paralHtml);

		paralHtml = "";
		paralHtml += '<div class="uploadFileListHeader">';
		paralHtml += '<div class="plName textClr overflowEllipsis">'+LAN.lan_1301104+'</div>';
		paralHtml += '<div class="plSize textClr">'+LAN.lan_1301105+'</div> <div class="plStatus textClr">'+LAN.lan_1301106+'</div>';
		paralHtml += '<div class="plAction textClr">'+LAN.lan_1301107+'</div></div>';
		paralHtml += '<ul class="uploadFileList">';
		paralHtml += '</ul> ';
		paralHtml += '<div class="reUploadAll"><span class="btnReUploadAll">全部重试</span></div>';
		$uploadContent.html(paralHtml);

		paralHtml = "";
		paralHtml += '<div class="uploadTipText">'+LAN.lan_1301111+'</div>';
		paralHtml += '<div class="uploadTipSize"></div>';
		$uploadFooter.html(paralHtml);

		$uploadBox.append($uploadHeader);
		$uploadBox.append($uploadContent);
		$uploadBox.append($uploadFooter);

		var isExists = false;

		if ($(".uploadBox").length > 0) {
			$uploadBox = $(".uploadBox");
			isExists = true;
		}
		this.Options.uploadId = "upload_" + (+new Date());
		$uploadBox.append('<input id="' + this.Options.uploadId + '" type="file" class="txtUpload" '+	(this.Options.isMulti ? 'multiple' : '' ) + ' />');


		//可以上传文件夹
		if (this.Options.isUploadFolder && this.Options.btnId) {

			this.Options.uploadFolderId = "uploadFolder_" + (+new Date());
			$uploadBox.append('<input id="' + this.Options.uploadFolderId + '" type="file" class="txtUpload" webkitdirectory />');

			var dropUpload = '<div class="uploadDropdownButtons"><ul><li class="uploadFileBtn btnItem ' + (this.Options.fileGa ? this.Options.fileGa : '') + '"><em class="sicon-file"></em>'+LAN.lan_1301002+'</li>';
			dropUpload += '<li class="uploadFolderBtn btnItem ' + (this.Options.folderGa ? this.Options.folderGa : '') + '"><em class="sicon-sfolder"></em>'+LAN.lan_1301003+'</li>';
			dropUpload += '</ul></div>';

			this.Options.$UploadButtoms = $(dropUpload);

			$("body").append(this.Options.$UploadButtoms);

		}

		if ($(".uploadBox").length <= 0) {
			$("body").append($uploadBox);
		}

		this.Options.$uploadBox = $uploadBox;

		return isExists;

	}

	//事件初始化
	UploadQuere.prototype.initEvent = function (file) {
		//移动
		this.move();
		this.Options.btnId && this.btnEvent(false);
		//处理按钮选择的文件
		this.uploadChange();

		this.Options.isDrop && this.bindDropEvent();

		//头部事件
		this.HeadEvent();

		//内容事件
		this.ContentEvent();

	}

	//内容事件
	UploadQuere.prototype.ContentEvent = function () {

		var that = this,
			$uploadBox = this.Options.$uploadBox;

		//重试
		$uploadBox.on("click", ".reUpload", function () {

			var id = $(this).closest(".uploadItem").attr("id");
			that.start(id);

		});

		//删除文件上传
		$uploadBox.on("click", ".btnCanelUpload", function () {

			var $item = $(this).closest(".uploadItem"),
				id = $item.attr("id");

			delete that.UploadFileList[id];

			that.UploadFileArr.splice(that.UploadFileArr.indexOf(id), 1);

			$item.remove();

		});

		//全部重试
		$uploadBox.on("click", ".reUploadAll", function () {
			//清空
			that.UploadFileArr.length = 0;

			$uploadBox.find(".iconErrorTip ").closest(".uploadItem").map(function () {
				that.UploadFileArr.push($(this).attr("id"));
			})

			that.Options.isReUploadAll = true;
			that.start();
		});

		//取消上传
		$uploadBox.on("click", ".btnCanelUploadPre", function () {

			var $item = $(this).closest(".uploadItem"),
				id = $item.attr("id");

			$item.attr("isCancel", true);
			//取消上传
			if (that.BreakUploadObj) {
				that.BreakUploadObj.Options.status = "pause";
			}
			that.Options.ReqAjax && that.Options.ReqAjax.abort();

			$item.find(".plStatus").text(LAN.lan_1301109);
			$item.find(".plAction").text("");

			that.Options.status = "wait";
			that.start();

		});





	}

	//头部事件
	UploadQuere.prototype.HeadEvent = function () {

		var that = this,
			Options = this.Options,
			$uploadBox = that.Options.$uploadBox;

		$uploadBox.on("click", ".uploadWindowSize", function () {

			if ($(this).hasClass("ZoomUpload")) {
				$uploadBox.animate({
					bottom: 10
				}, 500);
			} else {
				$uploadBox.animate({
					bottom: -376
				}, 500);
			}
			$(this).toggleClass("ZoomUpload");

		});

		//关闭窗口
		$uploadBox.on("click", ".uploadWindowClose", function () {

			$uploadBox.find(".uploadFileList").empty();
			$uploadBox.animate({
				bottom: -500
			}, 300);
			that.UploadFileArr.length = 0;
			that.UploadFileList = {};
			if (that.BreakUploadObj) {
				that.BreakUploadObj.Options.status = "pause";
			}

			that.Options.uploadCount = 0;
			that.Options.upLoadSuccess = 0;
			that.Options.upLoadFail = 0;

			that.Options.ReqAjax && that.Options.ReqAjax.abort();
			//等待上传
			that.Options.status = "wait";



		});

	}

	//按钮点击事件
	UploadQuere.prototype.btnEvent = function (isRepeatBind) {

		var that = this,
			Options = this.Options;

		//选择上传还是直接上传
		$(Options.btnId).on("click.uploadzp", function () {

			//上传回调
			if (Options.canUploadFile) {
				var result = Options.canUploadFile();
				if (!result) {
					return;
				}
			}

			if (Options.isUploadFolder) {

				var Offset = $(this).offset();

				Offset.top += $(this).height() + Options.Offset.y;
				Offset.left == Options.x;

				Options.$UploadButtoms.css({
					top: Offset.top,
					left: Offset.left
				});

				Options.$UploadButtoms.show();
			} else {
				//$(that.Options.uploadId).click(); 
				$("#" + Options.uploadId).click();
			}
		});

		//上传文件
		Options.$UploadButtoms && Options.$UploadButtoms.find(".uploadFileBtn").on("click.uploadzp", function () {
			$("#" + Options.uploadId).click();
		});

		//上传文件夹
		Options.$UploadButtoms && Options.$UploadButtoms.find(".uploadFolderBtn").on("click.uploadzp", function () {
			$("#" + Options.uploadFolderId).click();
		});

		if (isRepeatBind) {
			return;
		}

		$("body").on("click.uploadzp", function (event) {

			if ($(event.target).closest(Options.btnId).length <= 0) {
				Options.$UploadButtoms && Options.$UploadButtoms.hide();
			}
		});

	}

	//拖拽
	UploadQuere.prototype.bindDropEvent = function () {

		var that = this,
			Options = this.Options;

		$("body").on("dragleave.uploadzp", function (event) {
			//拖离 
			$(".dropLineStatus").removeClass("show");
			event.preventDefault();

		}).on("drop.uploadzp", function (event) {

			//拖后放 

			$(".dropLineStatus").removeClass("show");

			var isUpload = true,
				canUploadFile = that.Options.canUploadFile;

			if ($.isFunction(canUploadFile)) {
				isUpload = canUploadFile();
			}

			if (!isUpload) {
				return;
			}

			var files = event.originalEvent.dataTransfer.files,
				items = event.originalEvent.dataTransfer.items;


			if (items) {

				var allFiles = []

				for (var i = 0; i < items.length; i++) {

					if (items[i].kind !== 'file') continue;

					var entry = items[i].webkitGetAsEntry()

					if (entry.isFile) {
						_readFile(entry, function (file) {
							allFiles.push(file)
						})
					} else if (entry.isDirectory) {

						_traverseDirectory(entry, function (file) {
							allFiles.push(file);
						})
					}
				}

			}

			var timer = setTimeout(function () {
				if (allFiles.length > 0) {
					that.add(allFiles);
				}
			}, 600);



			event.preventDefault();


		}).on("dragenter.uploadzp", function (event) {

			var isUpload = true,
				canUploadFile = that.Options.canUploadFile;

			if ($.isFunction(canUploadFile)) {
				isUpload = canUploadFile();
			}

			if (!isUpload) {
				return;
			}


			$(".dropLineStatus").addClass("show");
			//拖进 
			event.preventDefault();

		}).on("dragover.uploadzp", function (event) {
			//拖来拖去 
			event.preventDefault();
		});

		//拖拽时候的绿色线
		var dropLine = '<div class="dropTopLine dropLineStatus"></div><div class="dropbottomLine dropLineStatus"></div>';
		dropLine += '<div class="dropLeftLine dropLineStatus"></div><div class="dropRightLine dropLineStatus"></div>';

		$("body").append(dropLine);

		$(window).on('beforeunload', function () {
			//return '有文件还未上传完成，确定要离开吗？' 
		})



		function _traverseDirectory(entry, callback) {
			if (entry.isFile) {
				_readFile(entry, callback)
			} else if (entry.isDirectory) {
				var dirReader = entry.createReader()
				dirReader.readEntries(function (entries) {
					var el = entries.length
					while (el--) {
						_traverseDirectory(entries[el], callback)
					}
				})
			}
		}

		function _readFile(fileEntry, callback) {
			fileEntry.file(function (file) {
				file.fullPath = fileEntry.fullPath
				callback && callback(file)
			})
		}
	}


	//处理upload
	UploadQuere.prototype.uploadChange = function () {

		var that = this;

		//上传单个文件
		$("#" + this.Options.uploadId).change(function () {
			that.add(this.files);
			$("#" + that.Options.uploadId).val("");

		});


		var btnFolderId = this.Options.uploadFolderId;

		if (btnFolderId) {

			$("#" + btnFolderId).change(function () {
				that.add(this.files);
				$("#" + btnFolderId).val("");
				//this.files[0].webkitRelativePath 
			});
		}

	}



	//移动
	UploadQuere.prototype.move = function () {

		var that = this;

		this.Options.$uploadBox.on("mousedown", ".uploadHeader", function (event) {


			var gapX = $(window).width() - event.pageX - parseInt(that.Options.$uploadBox.css("right"), 10),
				maxW = $(window).width() - that.Options.$uploadBox.width() - 20;

			$("body").on("mousemove.dragUpload", function (event) {

				var pageRight = $(window).width() - event.pageX,
					right = pageRight - gapX;

				if (right < 10) {
					right = 10;
				}

				if (right > maxW) {
					right = maxW;
				}

				that.Options.$uploadBox.css("right", right);

			});

			$("body").on("mouseup.dragUpload", function () {
				$("body").off("mousemove.dragUpload");
				$("body").off("mouseup.dragUpload");
			});

		});
	}


	//添加上传文件
	UploadQuere.prototype.add = function (files) {

		var isUpload = true,
			canUploadFile = this.Options.canUploadFile;

		if ($.isFunction(canUploadFile)) {
			isUpload = canUploadFile(files);
		}

		if (!isUpload) {
			return;
		}


		this.Options.$uploadBox.show();

		var len = files.length,
			paralHtml = "",
			file,
			uplodItemId;

		for (var i = 0; i < len; i++) {

			file = files[i];

			//0kb 不上传
			if (file.size == 0) {
				//continue;
			}

			uplodItemId = "uplodItemId_" + this.uploadNubmer;

			this.uploadNubmer += 1;

			this.UploadFileList[uplodItemId] = {};

			this.UploadFileList[uplodItemId].file = file;


			if (!$.isFunction(this.Options.getUploadUrl)) {
				alert("未定义getUploadUrl方法");
				return;
			}

			if (!$.isFunction(this.Options.getParentId)) {
				alert("getParentId未定义");
				return;
			}

			this.UploadFileList[uplodItemId].uploadUrl = this.Options.getUploadUrl();

			this.UploadFileList[uplodItemId].parentId = this.Options.getParentId();

			this.UploadFileArr.push(uplodItemId);

			paralHtml += '<li class="uploadItem" id="' + uplodItemId + '">';
			paralHtml += '<div class="plName overflowEllipsis textClr">' + file.name + '</div>';
			paralHtml += '<div class="plSize textClr">' + this.formatSize(file.size) + '</div><div class="plStatus textClr">0%</div><div class="plAction textClr"><i class="iconfont icon-close btnCanelUpload" title="'+LAN.lan_1301110+'"></i></div>';
			paralHtml += ' </li>';

			this.Options.uploadCount += 1;

		}


		this.Options.$uploadBox.find(".uploadFileList").append(paralHtml);

		this.Options.$uploadBox.show().css("bottom", "10px");

		var count = this.Options.$uploadBox.find(".uploadItem").length, //Options.uploadCount,
			succ = this.Options.$uploadBox.find(".iconSuccessTip").length;//Options.upLoadSuccess,

		var text = "(" + succ + "/" + count + ")";

		this.Options.$uploadBox.find(".uploadCount").text(text);

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

		this.confirmInterrupt();

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


		this.Options.$uploadBox.find(".uploadStatusTitle").text(LAN.lan_1301101);

		var file = uploadFileObj.file,

			that = this,

			data = {

				url: uploadFileObj.uploadUrl,

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
			this.fail({
				result: "fail",
				message: "上传文件不能为空"
			});
			return;
		}

		//分片 
		if (file.size > this.Options.normalSize && this.Options.MaxSize > file.size && App.isBreakPoint) {

			data.parentId = uploadFileObj.parentId;
			uploadFileObj.file.parentId = data.parentId;

			var fullPath = uploadFileObj.file.fullPath || uploadFileObj.file.webkitRelativePath;
			var pathArr = fullPath && fullPath.split("/") || [];

			var pathArr = [];

			if (uploadFileObj.file.fullPath) {
				//斩头去尾 留中间 
				pathArr = uploadFileObj.file.fullPath.split("/") || [];
				pathArr.pop();
				pathArr.shift();

			}

			if (uploadFileObj.file.webkitRelativePath) {

				pathArr = uploadFileObj.file.webkitRelativePath.split("/") || [];
				pathArr.pop();
			}

			//有路径
			if (pathArr.length > 0) {

				var result = this.checkPath(data.parentId, "/" + pathArr.join("/"));

				if (!result) {
					//失败
					this.fail(data);
					return;
				}

				data.parentId = result.fileId;

			}

			//上传新版本
			if (Options.isSameFile) {

				if ($.isFunction(Option.getFileName)) {
					data.fileName = Options.getFileName();
				} else {
					data.fileName = Options.fileName;
				}

				data.isSameFile = Options.isSameFile;
			}

			this.BreakUploadObj = BreakPointUpload(data);

		} else {
			//正常上传
			this.uploadNormal(data);

		}

		$("#" + Options.currentUploadId).find(".plAction").html('<i class="iconfont icon-close btnCanelUploadPre" title="'+LAN.lan_1301110+'"></i>');

		this.Options.status = "upload";


	}

	//检查路径是否存在
	UploadQuere.prototype.checkPath = function (rootParentId, filePath) {

		var data = {
			filePath: filePath,
			createWhenNotExists: true,
			rootParentId: rootParentId
		}, result = false;

		$.ajax({
			url: "/document/v2017/ws/" + this.Options.wsid + "/file/info/bypath",
			async: false,
			dataType: 'json',
			contentType: 'application/json',
			type: "post",
			data: JSON.stringify(data),
			success: function (data) {
				if (data.code == 0) {
					result = data.data.file;
				}
			}
		});

		return result;

	}

	//上传结束
	UploadQuere.prototype.uploadEnd = function () {

		this.removeInterrupt();

		var Options = this.Options;

		Options.$uploadBox.find(".uploadStatusTitle").text(LAN.lan_1301102);



		var count = Options.$uploadBox.find(".uploadItem").length, //Options.uploadCount,
			succ = Options.$uploadBox.find(".iconSuccessTip").length,//Options.upLoadSuccess,
			fail = count - succ,
			text = "";

		if (succ == 0) {
			text += "全部失败," + fail + LAN.lan_13023183;
		} else if (fail == 0) {
			text += LAN.lan_13023182 + succ + LAN.lan_13023183;
		} else {
			text = succ + LAN.lan_13023184 + fail + LAN.lan_13023185;
		}
		Options.$uploadBox.find(".uploadCount").text(text);

		if (Options.upLoadFail > 5) {
			Options.$uploadBox.find(".uploadFileList").addClass("reuploadAll");
			Options.$uploadBox.find(".reUploadAll").show();
		} else {
			Options.$uploadBox.find(".uploadFileList").removeClass("reuploadAll");
			Options.$uploadBox.find(".reUploadAll").hide();
		}

		this.Options.isReUploadAll = false;

	}

	UploadQuere.prototype.progress = function (data) {

		var loaded = data.loaded,
			tot = data.total,
			per = Math.floor(100 * loaded / tot);

		if (isNaN(per)) {
			return;
		}

		var $item = $("#" + data.fileId);

		//已取消的不用处理
		if ($item.attr("isCancel")) {
			return;
		}

		if(per == 100) {
			per = 99
		}

		$item.find(".plStatus").text(per + "%");

	}

	UploadQuere.prototype.success = function (data) {

		if (data && data.result == "fail") {
			this.fail(data);
			return;
		}
		this.Options.upLoadSuccess += 1;

		var $currentUpload = $("#" + this.Options.currentUploadId);

		$currentUpload.find(".plStatus").html("<i class='commoniconfont iconSuccessTip icon-shangchuanchenggong' title='"+LAN.lan_1301108+"'></i>");
		$currentUpload.find(".plAction").text("");

		this.BreakUploadObj = false;

		var count = this.Options.$uploadBox.find(".uploadItem").length, //Options.uploadCount,
			succ = this.Options.$uploadBox.find(".iconSuccessTip").length;//Options.upLoadSuccess,

		var text = "(" + succ + "/" + count + ")";

		this.Options.$uploadBox.find(".uploadCount").text(text);

		var fSuccess = this.Options.fSuccess;

		$.isFunction(fSuccess) && this.UploadFileList[this.Options.currentUploadId] && fSuccess(data, this.UploadFileList[this.Options.currentUploadId].file);

		this.Options.status = "wait";
		this.start();
	}

	UploadQuere.prototype.fail = function (data) {

		this.removeInterrupt();

		//取消上传了
		if (!this.UploadFileList[this.Options.currentUploadId]) {
			return;
		}

		var $currentUpload = $("#" + this.Options.currentUploadId),
			$plStatus = $currentUpload.find(".plStatus"),
			pre = $plStatus.text();

		//已取消的不用处理
		if ($currentUpload.attr("isCancel")) {
			return;
		}

		//取消算失败 不算上传失败
		this.Options.upLoadFail += 1;

		$plStatus.html("<i class=' iconfont iconErrorTip icon-shangchuanshibai' title='"+LAN.lan_1701794+"'></i><span class='blPre'>" + pre + "</span>");

		$currentUpload.find(".plAction").html("<span class='reUpload'>重试</span><span class='btnCanelUpload'>"+LAN.lan_1301710+"</span>");

		//放到第一个
		$currentUpload.parent().prepend($currentUpload);

		this.UploadFileList[this.Options.currentUploadId].status = "fail";

		//失败回掉
		var fError = this.Options.fError;

		$.isFunction(fError) && fError(data);

		this.Options.status = "wait";
		this.start();
	}


	//正常上传
	UploadQuere.prototype.uploadNormal = function (data) {

		var url = data.url,
			file = data.file,
			that = this;

		var formdata = new FormData(),
			fileName = file.webkitRelativePath || file.fullPath || file.name;

		if (this.Options.isSameFile) {
			if ($.isFunction(this.Options.getFileName)) {
				fileName = this.Options.getFileName();
			} else {
				fileName = this.Options.fileName;
			}
		}

		formdata.append("fileName", fileName);
		formdata.append("size", file.size);
		formdata.append("file", file);

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

		//解绑事件
		$("body").off("dragleave.uploadzp").off("drop.uploadzp").off("dragenter.uploadzp").off("dragover.uploadzp");

		var that = this,
			Options = this.Options;

		$(Options.btnId).off("click.uploadzp");
		Options.$UploadButtoms.find(".uploadFileBtn").off("click.uploadzp");
		Options.$UploadButtoms.find(".uploadFolderBtn").off("click.uploadzp");
		$("body").off("click.uploadzp");
	}

	//中断上传确认 —— 刷新页面
	UploadQuere.prototype.confirmInterrupt = function () {

		window.addEventListener("beforeunload", confirmLeave);

		$(document).off("click.a_Href_Onbeforeunload").on("click.a_Href_Onbeforeunload", "a", function (e) {
			var $target = $(e.target).closest("a");
			var target = $target.attr("target")
			var isCurrentLoad = !target || target == '_self' || target == '_parent' || target == '_top';
			if (isCurrentLoad) {
				var result = confirm("当前正在上传文档，将在新窗口中打开该页面");

				if (result) {
					var sourceTarget = $target.attr("target");
					
					if (!sourceTarget || sourceTarget != "_blank") {
						$target.attr("target", "_blank")
					  var timer =	setTimeout(function () {
							$target.attr("target", sourceTarget)
							clearTimeout(timer);
						}, 500)
					}
					window.removeEventListener("beforeunload", confirmLeave);

				} else {
					if (e && e.preventDefault) {
						e.preventDefault();
					} else {
						window.event.returnValue = false;
						return false;
					}
				}
			}
		});
	}

	UploadQuere.prototype.removeInterrupt = function () {
		window.removeEventListener("beforeunload", confirmLeave);
		$(document).off("click.a_Href_Onbeforeunload")
	}

	var confirmLeaveText = "有文件还未上传完成，确定要离开吗？"
	var confirmLeave = function (event) {
		event.returnValue = confirmLeaveText;
	}

})();