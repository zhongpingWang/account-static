import "./Index.css"


var Dialog = function (options) {
    this.options = {
        width: 560,
        height: null,
        title: '提示',
        showTitle: true,
        cssClass: null,
        inlineContentStyle: null,
        showClose: true,
        message: '你木有事做吗？你真的木有事做吗？缅怀青春吧~',
        limitHeight: true, //是否设置最大高度，如果设置则有滚动条
        isFixed: true,
        denyEsc: false,
        modal: true,
        minify: false,
        isAlert: false,
        isConfirm: true,
        initOkCallback: jQuery.noop,
        okText: '确&nbsp;&nbsp;定',
        cancelText: '取&nbsp;&nbsp;消',
        okClass: 'button-action',
        okCallback: jQuery.noop,
        okPreventDoubleClick: false,
        fixedposition: false,
        cancelClass: '',
        isSingle: true,
        keepMask: false,
        isWrapper: false, // 是否需要随屏滚动，默认为不滚动
        cancelCallback: jQuery.noop,
        hideCallback: jQuery.noop,
        closeCallback: jQuery.noop
    }
    jQuery.extend(this.options, options)
    this.init()
}
Dialog.prototype = {
    init: function (message, options) {
        //获得渲染页面
        var element = this.element = this.__getElement(),
            more = [],
            mIndex = 2000,
            zIndex = 4000

        this.bindEvent()

        //保持单例
        if (this.options.isSingle) {
            DialogManager.keepSingle(this)
        } else {
            more.push(element)
            var second = more.pop()
            second.css({
                'z-index': zIndex++
            })
            this.getMaskLayer().css({
                'z-index': ++mIndex
            })
        }

        // 添加到页面
        $(document.body).append(element)


        // 定位
        this.__offset()

        //拖动
        this.__dragable()

        //设置最大高度
        if (this.options.limitHeight) {
            this.find('.content').css({
                'max-height': $(document).height() * 0.6,
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            })
        }

        if (this.options.fixedposition) {
            this.find('.content').css({
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            })
        }

        if (this.options.inlineContentStyle) {
            this.find('.content').css(this.options.inlineContentStyle)
        }


        //是否显示关闭图标
        if (!this.options.showClose) {
            this.find('.close').hide()
        }

        // 显示
        this.show()
        this.dialogWrapper()
    },

    //获得渲染页面
    __getElement: function () {
        var fragment = ['<div class="mod-dialog">', '<div class="wrapper">', '<div class="header">', '<h3 class="title">',
            this.options.title, '</h3>',
            this.options.minify ? '<a class="minify">最小</a>' : '', '<a class="close"></a>', '</div>', '<div class="content">',
            '</div>', '</div>', '</div>'
        ].join('')
        var element = jQuery(fragment)

        if (typeof this.options.message == 'string') {
            element.find('.content').html(this.options.message)
        } else {
            $(this.options.message).appendTo(element.find('.content'))
        }

        if (this.options.isAlert) {
            element.find('.wrapper').append('<div class="footer clr"><button class="ok button ' + this.options.okClass + ' button-small">' + this.options.okText + '</button></div>')
        }
        if (this.options.isConfirm) {
            element.find('.wrapper').append('<div class="footer clr"><button class="ok button ' + this.options.okClass + ' button-small">' + this.options.okText + '</button></div>')
            var cancelBtn = $('<button class="cancel button button-small"></button>').html(this.options.cancelText).addClass(this.options.cancelClass)
            element.find('.footer').append(cancelBtn)
        }
        //是否显示头部
        if (!this.options.showTitle) {
            element.find('.header').remove()
        }
        // 设置样式
        element.css({
            width: this.options.width
        })

        if (this.options.height !== null) {
            element.find('.content').css({
                height: this.options.height
            })
        }
        if (this.options.isFixed !== true) {
            element.css({
                position: 'absolute'
            })
        }

        this.options.cssClass && element.addClass(this.options.cssClass)

        return element
    },

    //重新定位
    reLocation: function () {
        // 定位
        this.__offset()
    },

    __dragable: function () {
        var element = this.element
        element.draggable && element.draggable({
            containment: 'window',
            handle: '.header'
        })
    },

    //居中
    __offset: function () {
        var element = this.element,
            top = this.options.top,
            bottom = this.options.bottom,
            left = this.options.left
        if (left == null) {
            left = (jQuery(window).width() - this.element.outerWidth()) / 2
            left = Math.max(0, left)
        }

        // 如果TOP没有指定 那么垂直居中
        if (top == null) {
            top = (jQuery(window).height() - this.element.outerHeight()) / 2
            top = Math.max(0, top)
        }

        // 如果元素不是fixed定位 那么加上滚动条距离
        if (this.element.css('position') != 'fixed') {
            left += jQuery(document).scrollLeft()
            top += jQuery(document).scrollTop()
        }

        if (this.options.fixedposition) {
            element.find('.content').css({
                'height': $(window).height() - 2 * top
            })
        }
        element.css({
            left: left,
            top: top,
            bottom: bottom
        }).data('top', top)
    },

    //设置宽度
    setWith: function (width) {
        // 设置样式
        this.element.css({
            width: width
        })
        this.options.width = width
    },

    //获得头部
    getHeader: function () {
        return this.find('.wrapper > .header')
    },

    //获得尾部
    getFooter: function () {
        return this.find('.wrapper > .footer')
    },

    //获得遮罩
    getMaskLayer: function () {
        return MaskLayer.getElement()
    },

    //显示
    show: function () {
        var self = this
        if (self.options.modal === true) MaskLayer.show()
        self.__offset()
        var element = self.element
        var top = element.data('top')
        element.show().css('top', top - 20)
        element.animate({
            top: top,
            filter: 'alpha(opacity=100)',
            opacity: 1
        }, 300, function () {
            self.options.initOkCallback && self.options.initOkCallback(self)
        })
    },

    dialogWrapper: function () {
        var wrapper = null
        if (this.options.isWrapper) {
            wrapper = $('.mod-dialog-wrapper')
            wrapper.length && wrapper.remove()
            this.element.wrap("<div class='mod-dialog-wrapper'></div>")
        }
    },

    //关闭
    close: function (keepMask) {
        var self = !keepMask && MaskLayer.hide()
        var element = self.element
        var top = element.data('top')
        element.animate({
            top: top - 20,
            filter: 'alpha(opacity=0)',
            opacity: 0
        }, 300, function () {
            if (self.options.isWrapper) {
                element.closest('.mod-dialog-wrapper').remove()
            } else {
                element.remove()
            }
        })
    },

    //最小化
    hide: function () {
        MaskLayer.hide()
        this.element.hide()
        // this.options.hideCallback && this.options.hideCallback()
    },

    //查找元素
    find: function (rule) {
        return this.element.find(rule)
    },

    //确认
    confirm: function () {
        var self = this
        self.element.find('.footer .ok').trigger('click')
    },


    bindEvent: function () {
        var self = this
        this.find('.header .close').click(function () {
            if (self.options.closeCallback.call(self, self) !== false) {
                self.close(self.options.keepMask)
            }
            return false
        })
        this.find('.header .minify').click(function () {
            self.hide()
            return false
        })
        this.element.find('.footer .ok').click(function () {
            if (self.options.okPreventDoubleClick === true) {
                if ($(this).hasClass('disabled')) {
                    return false
                }
                $(this).addClass('disabled')
            }
            if (self.options.okCallback.call(self, self) !== false) {
                self.close(self.options.keepMask)
            }
            //return false
        })
        this.element.find('.footer .cancel').click(function () {
            if (self.options.cancelCallback.call(self, self) !== false) {
                self.close(self.options.keepMask)
            }
            return false
        })

        var contextProxy = function () {
            // 防止销魂元素后导致内存泄露（因为RESIZE事件是注册在WINDOW对象上 而不是ELEMENT元素上）
            if (self.element.parent().size() === 0) {
                jQuery(window).unbind('resize', contextProxy)
            } else if (self.element.is(':visible')) {
                self.__offset()

                if (self.options.limitHeight) {
                    self.find('.content').css({
                        'max-height': $(window).height() - 260
                    })
                }
            }
        }
        jQuery(window).resize(contextProxy)
        //任务详情
        if (location.href.indexOf("/coqui/page/detail?wsid") > 0) {
            jQuery(document).off('keydown.esc').on('keydown.esc', function () {

            })
        } else {
            jQuery(document).off('keydown.esc').on('keydown.esc', self.escCancel.bind(self))
        }

    },
    escCancel: function (e) {
        if (e.keyCode == 27) {
            // this.hide()
            this.find('.header .close').trigger('click')
        }
    },
    showError: function (text) {
        var self = this,
            error = self.find('.error')
        if (error.size() == 0) {
            error = $('<div class="error"><i class="dialog-error"></i><span class="error-info"></span></div>').prependTo(self.getFooter())
        }

        error.find('.error-info').html(text).show()
        error.show()
    },
    hideError: function () {
        this.find('.error').hide()
    }
}

//遮罩层
var MaskLayer = {
    getElement: function () {
        if (!this.element) {
            this.element = jQuery('#mod-dialog-masklayer')
            if (this.element.size && this.element.size() == 0) {
                this.element = jQuery('<div class="mod-dialog-masklayer" />').appendTo($(document.body))
            }
        }
        return this.element
    },
    show: function () {
        this.getElement().show()
    },
    hide: function () {
        this.getElement().hide()
    }
}

// 弹窗单例管理
var DialogManager = {
    present: null,

    keepSingle: function (dialog) {
        if (this.present instanceof Dialog) {
            this.present.close(dialog.options.keepMask)
            this.present = null
        }
        this.present = dialog
        this.bindEvent()
    },

    escCancel: function (e) {
        if (e.keyCode == 27 && DialogManager.present) {
            var dialog = DialogManager.present,
                element = dialog.element

            dialog.hide()
        }
    },

    bindEvent: function () {
        jQuery(document).keydown(this.escCancel)
        this.bindEvent = jQuery.noop
    }
}

// export public method
export default Dialog;