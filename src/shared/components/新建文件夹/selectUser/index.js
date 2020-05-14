function UserSelect($el, opts) {

    var defaults = {

        isAutoDiffPositon: true,

        claaaName: "",

        container: "", //容器 body 或者某个元素内

        isDialog: false,

        selType: "userDep", //选择类型 dep userDep

        isShowAllUser: false, //是否显示 所有成员 选项

        isShowCreatorUser: false, //是否显示 发起人 选项  

        isShowNear: false, //是否显示最近

        isShowAutoUser: false, //是否显示最近

        isShowWorksapce: false, // 是否显示项目列表

        zIndex: 100,

        wsid: window.glodonPageConfig ? window.glodonPageConfig.workspaceId : 0,

        Offset: {
            x: -22,
            y: 8
        },

        LiteSettings: {
            placeHolder: LAN.lan_1700608
        },

        type: "Lite", //类型 精简 全部  Lite Full

        FullSettings: { // 非精简时生效
            title: LAN.lan_1501401,
            placeHolder:LAN.lan_1700608,
            enterText: LAN.lan_1700510,
            cancelText:LAN.lan_1700511,
            errorTip: LAN.lan_1501401 //"请选择用户"
        },

        filterCallback: null, //过滤回调

        loadedCallback: null, //加载完成回调

        enterCallback: null, //确定回调

        canelCallback: null, //取消回调

        hideCallback: null, //关闭回调

        isPosition: true, // 是否设置定位

        filterUserIds: null,

        filterDepIds: null,

        frequentContact: [] //常用联系人
    };

    this.Settings = $.extend(defaults, opts);

    this.$el = $el;

    if (this.Settings.container == "") {
        this.Settings.container = $el.parent();
    }

    this.init();
}

//初始化
UserSelect.prototype.init = function () {
    var wrap = $('.wrapSelectUser')
    if (wrap.length) {
        wrap.remove()
    }

    //初始化box
    this.$selectUser = $('<div class="userSelectBox" style="display: none;"/>');
    this.$selectUser.addClass(this.Settings.claaaName);
    this.$selectUser.css("z-index", this.Settings.zIndex);
    this.$selectUser.addClass(this.Settings.type);
    this.$selectUser.html(this[this.Settings.type]());

    //box 类型
    if (!this.Settings.isDialog) {
        this.$selectUser.prepend('<span class="arrorOuter"><span class="arrorInner"></span></span>');
        $(this.Settings.container).append(this.$selectUser);
        this.$selectUser.wrap('<div class="wrapSelectUser" />');
    } else {
        $("body").append(this.$selectUser);
        $("body").append('<div class="userSelectBoxMask"  />');
        $(".userSelectBoxMask").css("z-index", this.Settings.zIndex - 1);
    }

    //公共事件
    this.commEvent();

    if (this.Settings.isShowWorksapce) {
        this.$selectUser.find('.header').after(this.workspaceTpl)
        this.__initWorkspaceList()
    }

    this.initFrequentContact();
    //事件绑定
    if (this.Settings.type == "Lite") {
        //精简事件
        this.initEventLite();
        if (!this.Settings.isShowNear && this.Settings.isShowAutoUser) {
            this.autoGetUser('');
        }
    } else {
        //大事件
        this.initEventFull();
        this.getAllDep();
    }

    var loadedCallback = this.Settings.loadedCallback;

    $.isFunction(loadedCallback) && loadedCallback();

    this.diffPosi();

}

UserSelect.prototype.__initWorkspaceList = function () {
    var self = this

    App.common.modules.util.getItems({
        url: '/workspace/workspaces?normal=true',
        success: function (data) {
            self.__renderWorkspaceList(data)
        }
    })
}

UserSelect.prototype.__renderWorkspaceList = function (renderData) {
    var self = this,
        data = {
            projects: renderData.items
        },
        first = renderData.items[0],
        tpl = '' +
        '{{#projects}}<li data-id="{{id}}">' +
        '   <span>{{name}}</span>' +
        '</li>{{/projects}}'

    var html = Mustache.render(tpl, data)

    if (self.Settings.wsid) {
        self.__workspaceName = _.filter(renderData.items, function (item) {
            return item.id == self.Settings.wsid
        })[0].name
    } else {
        self.Settings.wsid = first.id // 首次加载设置默认值
        self.__workspaceName = first.name
    }
    self.$selectUser.find('.userSelectWorkspace .drp-menus').html(html)
    self.$selectUser.find('.userSelectWorkspace .txt').text(self.__workspaceName)


}

//公共事件 精简和普通都用到
UserSelect.prototype.commEvent = function () {
    var that = this;
    //展开部门
    this.$selectUser.on("click", ".depItem .btnSwitch", function () {

        var $this = $(this);

        if ($this.hasClass("icon-arrowright")) {

            $this.removeClass("icon-arrowright").addClass("icon-arrowdown16");

            var depId = $this.attr("depid"),
                $ul = $this.parent().next();

            if ($ul.find("li").length > 0) {
                $ul.show();
                return;
            }

            $ul.html('<li class="userItem noneUser">'+LAN.lan_1700610+'</li>');
            //渲染部分更具id
            that.renderDepById(depId, $ul);

        } else {
            $this.addClass("icon-arrowright").removeClass("icon-arrowdown16");
            $this.parent().next().hide();
        }

    });

    this.$selectUser.on('click', '.userSelectWorkspace', function (e) {
        var scope = $(this),
            dropMenu = scope.find(".drp-menus").show();

        dropMenu.off('click').on('click', 'li', function (e) {
            var __this = $(this),
                workspaceName = $.trim(__this.text()),
                workspaceId = __this.data('id')

            that.$selectUser.find('.selUsers').html('<li class="selItem noneUser">'+LAN.lan_1501401+'</li>')
            scope.find('.txt').text(workspaceName)
            that.__workspaceName = workspaceName
            that.Settings.wsid = workspaceId
            that.getAllDep()
            that.initFrequentContact();

            dropMenu.hide();
            that.$selectUser.find(".search-list").hide();
            return false
        })

        $(document).one('click', function () {
            dropMenu.hide()
        })

        return false
    })
}

//初始化常用联系人
UserSelect.prototype.initFrequentContact = function () {
    var that = this;
    var noUserTpl = '<li class="no-user">'+LAN.lan_1700612+'</li>';
    var $ul = that.$selectUser.find(".frequent-contact ul");
    $ul.html(noUserTpl);
    // 只显示部门则不用加载常用联系人
    if (that.Settings.selType == "dep") {
        return;
    }
    that.Settings.frequentContact = [];
    $.when(this.getFrequentContact()).then(function (res) {
        if (res.message == "success" && res.data && res.data.length) {
            var list = res.data;
            var filterUserIds = that.Settings.filterUserIds;
            if (filterUserIds && filterUserIds.length > 0) {
                list = $.map(list, function (item) {
                    for (var i = 0; i < filterUserIds.length; i++) {
                        var isExited = false
                        if (item.id == filterUserIds[i].userId) {
                            isExited = true
                            break
                        }
                    }
                    if (!isExited) {
                        var name = item.name || item.realName;
                        item.titleName = name.match(/.{1,26}/gi).join("\n");
                        return item
                    }
                })
            } else {
                list = $.map(list, function (item) {

                    var name = item.name || item.realName;
                    item.titleName = name.match(/.{1,26}/gi).join("\n") || '';
                    return item
                })
            }

            // Lite 最近联系人默认显示，没有时不显示
            if (list.length > 0) {
                that.Settings.frequentContact = list;
                var html = Mustache.to_html(that.frequentTpl, {
                    Users: list
                });
                $ul.html(html);
                $ul.children(".userItem").find(".userImg").after('<span class="sicon-checkbox"></span>');
                that.$selectUser.find(".frequent-contact").show();
                that.$selectUser.find(".containers").removeClass("no-frequent").addClass("has-frequent")
                    .find(".frequent-btn").click();
            } else {
                that.$selectUser.find(".containers").removeClass("has-frequent").addClass("no-frequent")
                    .find(".dep-btn").click();
                if (that.Settings.type == "Lite") {
                    that.$selectUser.find("ul.Users").css("margin-top", "-8px");
                }
            }
        } else {
            that.$selectUser.find(".containers").removeClass("has-frequent").addClass("no-frequent")
                .find(".dep-btn").click();
        }
    })
}

//渲染人员后同步常用联系人的信息，如已选中则做相关处理
UserSelect.prototype.handlerUserRender = function ($ul) {
    var that = this;
    var $userLi = $ul.find("li.userItem"); // 所以人员
    var $userNum = $userLi.length;
    if ($userNum > 0) {
        var $selectUser = that.$selectUser.find(".selUsers li");
        var $selectUserNum = $selectUser.length;
        if ($selectUserNum > 0) {
            var $selectUserList = []; // 已选人员
            for (var i = 0; i < $selectUserNum; i++) {
                var id = $selectUser[i].getAttribute("id");
                id && $selectUserList.push(id);
            }
            $.map($userLi, function (item) {
                var userId = item.getAttribute("userid");
                if (_.contains($selectUserList, userId)) {
                    $(item).find(".sicon-checkbox").addClass("selected");
                }
            })
        }
    }
}

//--------------------------------------- Full -------------------------------------------------------------------

//正常事件
UserSelect.prototype.initEventFull = function () {

    var that = this;
    //展开部门
    this.$selectUser.on("click", ".sicon-checkbox", function () {


        var $this = $(this),
            $parent = $this.parent(),
            $li = $("<li class='selItem' />"),
            $selectUser = that.$selectUser.find(".selUsers"),
            html = '',
            filterCallback = that.Settings.filterCallback,
            result = true,
            id,
            type;

        if ($parent.is("div")) {
            id = $parent.attr("depid");
            type = "dep";
        } else {
            id = $parent.attr("userid");
            type = "user";
        }

        if ($.isFunction(filterCallback)) {
            result = filterCallback(id);
        }

        if (result == false) {
            return;
        }

        //选中取消
        if ($this.hasClass("selected")) {

            $selectUser.find("li[id='" + id + "']").remove();

            var len = $selectUser.find("li").length;
            if (len <= 0) {
                $selectUser.append('<li class="selItem noneUser">'+LAN.lan_1501401+'</li>');
            }

            that.$selectUser.find(".rightSelects .count").text(len);

            if (type == "user") {
                that.$selectUser.find("li[userid=" + id + "]").find(".sicon-checkbox").removeClass("selected");
            } else {
                $this.removeClass("selected");
            }

            return;
        }

        //添加之前判断是否存在
        if ($selectUser.find("li[id='" + id + "']").length > 0) {
            App.Plugin.Message.error("已存在"); 
            return;
        }

        $li.attr("id", id);

        if ($parent.is("div")) {
            //部门
            $li.data("type", 1);

            if(id=="CREATORUSER") {
                html = '<i class="commoniconfont icon-ziyuan- iconCreatorUser"></i>'
            } else {
                html = '<i class="commoniconfont icon-tree iconDep"></i>'
            }

            html +=  '<span class="depText overflowEllipsis">' + $parent.find(".spName").text() + '</span>' +
            '<i class="commoniconfont icon-delete16 btnDelete" title="' + LAN.lan_1900309 + '"></i>';

        } else {
            //2 是成员
            $li.data("type", 2);

            html = '<img class="selImg" src="' + $parent.find(".userImg").prop("src") + '" />' +
                '<span class="depText overflowEllipsis">' + $parent.find(".spName").text() + '</span>' +
                '<i class="commoniconfont icon-delete16 btnDelete" title="' + LAN.lan_1900309 + '"></i>';

        }

        $li.append(html);
        $selectUser.append($li);
        $selectUser.find(".noneUser").remove();

        that.$selectUser.find(".rightSelects .count").text($selectUser.find("li").length);

        //选中  常用联系人以及按部门选择
        // $(this).addClass("selected");
        if (type == "user") {
            that.$selectUser.find("li[userid=" + id + "]").find(".sicon-checkbox").addClass("selected");
        } else if (type == "dep") {
            $this.addClass("selected");
        }

    });

    //关闭
    this.$selectUser.on("click", ".btnClose,.btnCancel", function () {
        that.destroy();
    });

    //确认
    this.$selectUser.on("click", ".btnEnter", function () {

        var $selUsers = that.$selectUser.find(".selUsers .selItem:not('.noneUser')");
        if ($selUsers.length <= 0) {
            alert(that.Settings.FullSettings.errorTip);
            return;
        }

        var data = {
                Users: [],
                Deps: []
            },
            enterCallback = that.Settings.enterCallback,
            result = true;

        $selUsers.each(function () {
            var $this = $(this);

            if ($this.data("type") == 1) {
                data.Deps.push({
                    id: $this.attr("id"),
                    name: $this.find(".depText").text()
                });
            } else {
                data.Users.push({
                    id: $this.attr("id"),
                    avatar: $this.find('.selImg').attr('src'),
                    name: $this.find(".depText").text()
                });
            }

        });

        if ($.isFunction(enterCallback)) {
            if (that.Settings.isShowWorksapce) {
                $.extend(data, {
                    wsId: that.Settings.wsid,
                    wsName: that.$selectUser.find('.dropdown-toggle .labName').text()
                })
            }
            result = enterCallback(data);
        }

        if (result != false) {
            that.destroy();
        }

    });


    this.$selectUser.on("click", ".btnDelete", function () {
        var $parent = $(this).parent(),
            type = $parent.data("type"),
            id = $parent.attr("id"),
            $item = false;

        if (type == 1) {
            $item = that.$selectUser.find(".userItem[depid='" + id + "']");
        } else {
            $item = that.$selectUser.find(".userItem[userid='" + id + "']")
        }

        if ($item.length > 0) {

            var $siconCheckbox = $item.find(".sicon-checkbox");

            if ($siconCheckbox.hasClass("selected")) {
                $siconCheckbox.each(function (index, item) {
                    if (index === 0) {
                        $(item).click();
                    } else {
                        $(item).removeClass("selected");
                    }
                });
            } else {
                $parent.remove();
            }

        } else {
            $parent.remove();
        }

    });

    //自动搜索
    this.$selectUser.find(".txtUserFull").on("keyup", function (e) {

        var $this = $(this);

        var val = $this.val().trim();

        if (!val) {
            that.getAllDep();
            that.$selectUser.find(".search-list").hide();
        } else {
            that.autoGetUser(val);
            that.$selectUser.find(".search-list").show();
        }

        e.stopPropagation();
        return false;

    });

    //选择成员
    this.$selectUser.find('.user-list-select').on('click', '.userItem', function (e) {
        var target = $(e.target);
        if (!target.hasClass("sicon-checkbox")) {
            target.closest(".userItem").find('.sicon-checkbox').click();
        }
    });

    //切换常用联系人和按部门查找
    this.$selectUser.on('click', '.tipText span', function (e) {
        var target = $(e.target);
        if (!target.hasClass("selected")) {
            target.parent().find(".selected").removeClass("selected");
            target.addClass("selected");
            var frequent = that.$selectUser.find(".frequent-contact");
            var user = that.$selectUser.find("ul.Users");
            if (target.hasClass("frequent-btn")) {
                frequent.show();
                user.hide();
            } else {
                frequent.hide();
                user.show();
            }
        }
    })

}

UserSelect.prototype.Full = function () {

    var FullSettings = this.Settings.FullSettings;

    var html = '<div class="header">';
    html += '<span class="titleText">' + FullSettings.title + '</span>';
    html += '<span class="btnClose commoniconfont  icon-close16" title="'+LAN.lan_1700607+'"></span>';
    html += '</div>';
    html += '<input type="text" class="txtUserFull" placeholder="' + FullSettings.placeHolder + '" />';
    html += '<div class="containers">';
    html += ' <div class="leftDeps">';
    html += '   <div class="tipText"><span class="dep-btn">'+LAN.lan_1700609+'</span><span class="frequent-btn">'+LAN.lan_1900305+'</span></div>';
    html += '   <div class="userBox"> ';
    html += '    <ul class="Users"></ul>';
    html += '    <div class="user-list-select frequent-contact"><ul></ul></div>';
    html += '    <div class="user-list-select search-list"><ul></ul></div>';
    html += '   </div>';
    html += ' </div>';
    html += ' <div class="rightSelects">';
    html += ' <div class="tipText">';
    html += '  '+LAN.lan_1700613+'(<span class="count">0</span>)';
    html += ' </div>';
    html += ' <ul class="selUsers">';
    html += '  <li class="selItem noneUser">'+LAN.lan_1501401+'</li>';
    html += ' </ul>';
    html += ' </div>';
    html += ' </div>';
    html += ' <div class="myFooter">';
    html += '  <span class="btnEnter"> <i class="commoniconfont icon-confirm16"></i> <em class="text">' + FullSettings.enterText + '</em></span>';
    html += '  <span class="btnCancel"> <i class="commoniconfont icon-cancel16"></i> <em class="text">' + FullSettings.cancelText + '</em></span>';
    html += ' </div>';
    return html;
}

//--------------------------------------- Full End -------------------------------------------------------------------



//--------------------------------------- Lite -------------------------------------------------------------------

//精简事件
UserSelect.prototype.initEventLite = function () {


    var $this, that = this,
        type = "getUser",
        txtUser = this.$selectUser.find(".txtUser"),
        userBox = this.$selectUser.find(".userBox"),
        frequent = this.$selectUser.find(".frequent-contact")
    //自动搜索
    txtUser.on("keyup", function (e) {

        $this = $(this);

        var val = $this.val().trim(),
            type = $this.data('type');

        if (!val) {
            if (!type || type == 'user') {
                that.autoGetUser(val);
                //选人模式下
                frequent.show();
            } else if (type == 'dep') {
                that.getAllDep();
            }
        } else {
            that.autoGetUser(val);
            frequent.hide();
        }

        e.stopPropagation();
        return false;
    });

    var depSelect = this.$selectUser.find(".depSelect"),
        userSelect = this.$selectUser.find(".userSelect"),
        clearTxtUser = function () {
            txtUser.val("");
            userBox.removeClass('frequent');
        }
    //按部门筛选
    depSelect.click(function () {
        $(this).hide();
        userSelect.show();
        frequent.hide();
        that.getAllDep();
        txtUser.data('type', 'dep');
        clearTxtUser();
    });

    //按用户筛选
    userSelect.click(function () {
        $(this).hide();
        depSelect.show();
        if (that.Settings.frequentContact.length) {
            frequent.show();
        }
        that.autoGetUser('');
        txtUser.data('type', 'user');
        clearTxtUser()
    });


    this.$selectUser.on("click", "li.userItem,.depItem .userItem[userid]", function () {

        var enterCallback = that.Settings.enterCallback,
            $this = $(this),
            result = true;

        if ($this.hasClass('noneUser')) { // 如果无用户
            return
        }

        //回调
        if ($.isFunction(enterCallback)) {
            result = enterCallback({
                name: $this.attr("title"),
                id: $this.attr("userid")
            });
        }

        if (result != false) {
            that.destroy(eventKey);
        }

    });

    if (this.Settings.depSelect) {
        this.bindSelectByDep();
    }


    var eventKey = this.Settings.eventKey = "click.selectUser_" + (+new Date());

    //不延时 如果是 点击绑定 则 跪了
    var timer = setTimeout(function () {
        clearTimeout(timer);
        $("body").on(eventKey, function (event) {
            var $target = $(event.target);
          
            if ($target.closest(".userSelectBox").length <= 0) {
                that.destroy(eventKey);
                that.Settings.hideCallback && that.Settings.hideCallback()
            } 
        });

    }); 


}

UserSelect.prototype.bindSelectByDep = function () {
    var that = this
    var eventKey = this.Settings.eventKey = "click.selectUser_" + (+new Date());

    this.$selectUser.on("click", ".depItem .userItem[depid] .dpItemName", function (e) {
        var enterCallback = that.Settings.enterCallback,
            $item = $(this).closest('.userItem'),
            result = true;

        if ($item.hasClass('noneUser')) { // 如果无用户
            return
        }

        //回调
        if ($.isFunction(enterCallback)) {
            result = enterCallback({
                type: 'dep',
                name: $item.attr("title"),
                depid: $item.attr("depid")
            });
        }

        if (result != false) {
            that.destroy(eventKey);
        }

        e.stopPropagation();
        return false;
    });
}

//渲染部门
UserSelect.prototype.renderDepById = function (depId, $ul) {

    var that = this,
        filterUserIds = that.Settings.filterUserIds,
        filterDepIds = that.Settings.filterDepIds;

    $.when(this.getDepById(depId), this.getUsersBydepId(depId)).then(function (depData, userData) {
        depData = depData[0];
        userData = userData[0];

        var html = '';

        //部门
        if (depData && depData.items && depData.items.length > 0) {

            if (filterDepIds && filterDepIds.length > 0) {
                depData.items = $.map(depData.items, function (item) {
                    for (var i = 0; i < filterDepIds.length; i++) {
                        var isExited = false
                        if (item.id == filterDepIds[i].depId) {
                            isExited = true
                            break
                        }
                    }

                    if (!isExited) {
                        var name = item.name || item.realName;
                        item.titleName = name.match(/.{1,26}/gi).join("\n");
                        return item
                    }
                })
            } else {

                depData.items = $.map(depData.items, function (item) {
                    var name = item.name || item.realName;
                    item.titleName = name.match(/.{1,26}/gi).join("\n");
                    return item
                })
            }


            html = Mustache.to_html(that.depTpl, {
                Users: depData.items
            });

        }

        //成员  如果只显示部门则不用加载成员
        if (userData && userData.items && userData.items.length > 0 && that.Settings.selType != "dep") {

            if (filterUserIds && filterUserIds.length > 0) {
                userData.items = $.map(userData.items, function (item) {
                    for (var i = 0; i < filterUserIds.length; i++) {
                        var isExited = false
                        if (item.memberId == filterUserIds[i].userId) {
                            isExited = true
                            break
                        }
                    }

                    if (!isExited) {
                        return item
                    }
                })
            }

            html += Mustache.to_html(that.userTpl, {
                Users: userData.items
            });

        }

        if (html != '') {

            $ul.html(html);

            var pLeft = $ul.parents("li").length * 24;

            $ul.children(".depItem").find(".userItem").css("padding-left", pLeft);

            $ul.children(".userItem").css("padding-left", pLeft);

            //添加checkbox
            if (that.Settings.type == "Full") {
                //选中部门
                if (that.Settings.selType == "dep") {

                    $ul.children(".depItem").find(".userItem").find(".btnSwitch").after('<span class="sicon-checkbox"></span>');

                } else if (that.Settings.selType == "user") {
                    $ul.children(".userItem").find(".userImg").after('<span class="sicon-checkbox"></span>');
                } else {
                    $ul.children(".depItem").find(".userItem").find(".btnSwitch").after('<span class="sicon-checkbox"></span>');
                    $ul.children(".userItem").find(".userImg").after('<span class="sicon-checkbox"></span>');
                }
            }
            that.handlerUserRender($ul);
        } else {
            var pLeft = $ul.parents("li").length * 24;
            $ul.html('<li class="userItem noneUser">'+LAN.lan_1700611+'</li>');
            if (pLeft > 24) {
                $ul.find(".userItem").css({
                    "padding-left": pLeft,
                    "margin-left": "21px"
                });
            }

        }

    });

}

//更具id获取部门
UserSelect.prototype.getDepById = function (depId) {
    return $.ajax({
        url: "/workspace/" + this.Settings.wsid + "/group/" + depId
    });
}

//更具id获取成员
UserSelect.prototype.getUsersBydepId = function (depId) {
    return $.ajax({
        url: "/workspace/" + this.Settings.wsid + "/group//member/list?groupId=" + depId
    });
}

//获取常用联系人
UserSelect.prototype.getFrequentContact = function () {
    return $.ajax({
        url: "/workspace/v2017/ws/" + this.Settings.wsid + "/members/history"
    })
}

//获取所有部门
UserSelect.prototype.getAllDep = function () {

    var tpl = this.depTpl,
        that = this,
        filterDepIds = that.Settings.filterDepIds;

    that.$selectUser.find(".userBox .Users").html('<li class="userItem noneUser">搜索中……</li>');

    $.ajax({

        url: "/workspace/" + this.Settings.wsid + "/groups/",

        success: function (data) {

            data = data && data.items;


            if (data && data.length > 0) {

                if (that.Settings.isShowAllUser) { //显示所有成员 选项
                    data.unshift({
                        id: 'ALLUSER',
                        type: 'allmember',
                        name: '所有成员'
                    })
                }

                if (LAN.key != "CHS") { 
                    LAN_Util.NoneGroup(data);
               } 

                if (filterDepIds && filterDepIds.length > 0) {
                    data = $.map(data, function (item) {
                        for (var i = 0; i < filterDepIds.length; i++) {
                            var isExited = false
                            if (item.id == filterDepIds[i].depId) {
                                isExited = true
                                break
                            }
                        }
                        if (!isExited) {
                            var name = item.name || item.realName;
                            item.titleName = name.match(/.{1,26}/gi).join("\n");
                            return item
                        }
                    })
                } else {
                    data = $.map(data, function (item) {
                        var name = item.name || item.realName;
                        item.titleName = name.match(/.{1,26}/gi).join("\n");
                        return item
                    })
                }


                if (that.Settings.isShowCreatorUser) { //显示发起人 选项
                    data.push({
                        id: 'CREATORUSER',
                        type: 'creatoruser',
                        name: LAN.lan_1701101,
                        isShowCreatorUser: true
                    })
                }


                var html = Mustache.to_html(tpl, {
                    Users: data
                });
                that.$selectUser.find(".userBox .Users").html(html);

                //添加checkbox
                if (that.Settings.type == "Full") {

                    var $lis = that.$selectUser.find(".userBox .Users .depItem"),
                        selType = that.Settings.selType;

                    //选中部门
                    if (selType == "dep" || selType == "userDep") {
                        $lis.find(".btnSwitch").after('<span class="sicon-checkbox"></span>');
                    }

                }

            } else {

                that.$selectUser.find(".userBox .Users").html('<li class="userItem noneUser">无部门</li>');

            }

            // that.diffPosi();

        }

    });
}

UserSelect.prototype.workspaceTpl = '' +
    '<div class="userSelectWorkspace">' +
    '   <div class="dropdown-toggle" type="button" data-toggle="dropdown"><span class="labName txt">所有状态</span><span class="caret-msg"></span></div>' +
    '       <ul class="drp-menus">' +
    '       </ul>' +
    '</div>'

UserSelect.prototype.frequentTpl = '{{#Users}}<li class="userItem" title="{{titleName}}" userid="{{id}}"><img class="userImg" src="//' + App.Config.UrlConf.accountURL + '/avatar/show/{{id}}/32"/>' +
    '<span class="spName overflowEllipsis">{{name}}</span></li>{{/Users}}';

UserSelect.prototype.userTpl = '{{#Users}}<li class="userItem" title="{{realName}}" userid="{{memberId}}"><img class="userImg" src="//' + App.Config.UrlConf.accountURL + '/avatar/show/{{memberId}}/32"/>' +
    '<span class="spName overflowEllipsis">{{realName}}</span></li>{{/Users}}';

UserSelect.prototype.depTpl = '{{#Users}}<li class="depItem">' +
    '<div class="userItem" title="{{titleName}}" depid="{{id}}">' +
    '   <i class="commoniconfont icon-arrowright btnSwitch" depid="{{id}}"></i>' +
    '   <span class="dpItemName">' +
    '       {{^isShowCreatorUser}}<i class="commoniconfont icon-tree iconDep"></i>{{/isShowCreatorUser}}' +
    '       {{#isShowCreatorUser}}<i class="commoniconfont icon-ziyuan- iconCreatorUser"></i>{{/isShowCreatorUser}}' +
    '       <span class="spName overflowEllipsis">{{name}}</span>' +
    '   </span>' +
    '</div>' +
    '<ul class="fullUsersSub"></ul></li>{{/Users}}';

//自动匹配用户
UserSelect.prototype.autoGetUser = function (name) {
    var tpl = this.userTpl,
        that = this,
        loadingText = '搜索中'

    if (!name) {
        loadingText = LAN.lan_1600613
    }
    var $ul;
    if (that.Settings.type == "Full") {
        $ul = that.$selectUser.find(".userBox .search-list");
    } else {
        $ul = that.$selectUser.find(".userBox .Users");
    }
    $ul.html('<li class="userItem noneUser">' + loadingText + '……</li>');

    $.ajax({

        url: "/workspace/" + this.Settings.wsid + "/member/search",

        data: {
            name: name
        },

        success: function (data) {

            if (data && data.length > 0) {
                var filterUserIds = that.Settings.filterUserIds

                if (filterUserIds && filterUserIds.length > 0) {
                    data = $.map(data, function (item) {
                        for (var i = 0; i < filterUserIds.length; i++) {
                            var isExited = false
                            if (item.memberId == filterUserIds[i].userId) {
                                isExited = true
                                break
                            }
                        }

                        if (!isExited) {
                            var name = item.name || item.realName;
                            item.titleName = name.match(/.{1,26}/gi).join("\n");
                            return item
                        }
                    })
                } else {
                    data = $.map(data, function (item) {
                        var name = item.name || item.realName;
                        item.titleName = name.match(/.{1,26}/gi).join("\n");
                        return item
                    })
                }



                var html = Mustache.to_html(tpl, {
                    Users: data
                });

                $ul.html(html);

                if (data.length <= 0) {
                    $ul.html('<li class="userItem noneUser">未搜索到用户</li>');
                    that.diffPosi();
                    return
                }

                //添加checkbox
                if (that.Settings.type == "Full") {
                    //选中部门
                    if (that.Settings.selType == "dep") {
                        $ul.children(".depItem").find(".userItem").find(".btnSwitch").after('<span class="sicon-checkbox"></span>');
                    } else if (that.Settings.selType == "user") {
                        $ul.children(".userItem").find(".userImg").after('<span class="sicon-checkbox"></span>');
                    } else {
                        $ul.children(".depItem").find(".userItem").find(".btnSwitch").after('<span class="sicon-checkbox"></span>');
                        $ul.children(".userItem").find(".userImg").after('<span class="sicon-checkbox"></span>');
                    }

                    //已选的做标记
                    var selectedUser = ';';
                    that.$selectUser.find(".rightSelects li.selItem").each(function (_, selectItem) {
                        selectedUser = selectedUser + ";" + $(selectItem).attr("id");
                    });
                    $ul.children(".userItem").each(function (index, item) {
                        var userId = $(item).attr("userid");
                        if (selectedUser.indexOf(userId) > 0) {
                            $(item).find(".sicon-checkbox").addClass("selected");
                        }
                    })

                } else {
                    var title = $('<li><div class="title">'+LAN.lan_1701001+'</div></li>');
                    title.insertBefore($ul.find("li:first"));
                }

            } else {

                $ul.html('<li class="userItem noneUser">未搜索到用户</li>');

            }

            that.diffPosi();

        }

    });

}

//销毁
UserSelect.prototype.destroy = function () {
    if (this.Settings.type == "Lite") {
        $("body").off(this.Settings.eventKey);
        this.$selectUser.remove();
    } else {
        this.$selectUser.next().remove();
        this.$selectUser.remove();
    }
}


//计算位置
UserSelect.prototype.diffPosi = function () {
    var topClass = 'userSelectTopBox';
    this.$selectUser.removeClass(topClass)

    if (!this.Settings.isDialog && this.Settings.isPosition) {

        var w = this.$el.width() / 2 + this.Settings.Offset.x,
            h = this.$el.height() + this.Settings.Offset.y

        if (this.$selectUser.height() + this.$el.offset().top + 10 >= $(window).height()) {
            h = this.Settings.Offset.y - this.$selectUser.height() - this.$el.height()
        } else {
            topClass = ''
        }

        this.$selectUser.addClass(topClass).css({
            top: h,
            left: w
        });
    } else {
        this.$selectUser.addClass("center");
    }
    var self = this;
    setTimeout(function () {
        self.$selectUser.show()
    }, 80);
}

UserSelect.prototype.Lite = function () {
    var html = ' <input type="text" placeholder="' + this.Settings.LiteSettings.placeHolder + '" class="txtUser" />';
    html += '<div class="nearBox userBox">';
    html += '  <ul class="frequent-contact">';
    html += '    <li><div class="title">最近</div></li>';
    html += '    <li><ul><li class="no-user">没有最近联系的成员</li></ul></li>';
    html += '  </ul>';
    html += '  <ul class="Users">';
    html += '  </ul>';
    html += ' </div>';
    html += ' <div class="depSelect">';
    html += '  按部门查找';
    html += ' </div>';
    html += ' <div class="userSelect none">';
    html += '  按成员查找';
    html += ' </div>';
    return html;
}

//--------------------------------------- Lite End -------------------------------------------------------------------


export default function (opts) {

    return this.each(function () {
        return new UserSelect($(this), opts);
    });
}