import Vue from "vue"

import Main from "./Index.vue"

let DialogConstructor = Vue.extend(Main);


let zIndex = 2000;

let instances = [];

let isBandESC = false;


function bindESC() {

    $("body").on("keyup.dialogv", function (event) {

        if (event.keyCode == 27 && instances.length > 0) { 

            let index = instances.length-1;

            let delInstance = instances[index];

            if (delInstance) {

                delInstance.close(delInstance.Settings.isCloseAnimate);

            }

        }

    });
}


export default function (props) {

    //默认参数
    let DefaultOptons = {
        message: "内容",
        title: "提示",
        isNotAnimate: false,
        isMove: false,
        style: {},
        Warpstyle: {},
        MarkStyle: {},
        okText: '确定',
        canelText: '取消',
        cssClass: "",
        okCb: $.noop,
        canelCb: $.noop,
        showMask: true,
        showHeader: true,
        isCloseAnimate: true,
        showFooter: true,
        Constructor: false
    };


    let Options = $.extend(DefaultOptons, props);

    let instance = new DialogConstructor({
        propsData: {
            Settings: Options
        }
    });

    instance.close = (isAnimate, isNotCallback) => {

        if (!isNotCallback) {

            let result = instance.Settings.canelCb && instance.Settings.canelCb();

            if (result == false) {
                return;
            }
        }

        removeInstance(instance);
        
    }

    //instance.prototype.close = instance.close;


    //实例化
    instance.vm = instance.$mount();

    instance.dom = instance.vm.$el;

    document.body.appendChild(instance.dom);

    instance.dom.style.zIndex = zIndex++;

    instances.push(instance);


    //绑定esc
    !isBandESC && bindESC();

    isBandESC = true;

    return instance;

}

//删除数组中的数据
function removeInstance(instance) {

    let index = "notfind";

    $.each(instances, function (i, item) {

        if (item._uid == instance._uid) {
            index = i;
            return false;
        }
    });

    instance.$destroy(true);
    instance.$el.parentNode && instance.$el.parentNode.removeChild(instance.$el);

    if (index == "notfind") {
        return;
    }

    instances.splice(index, 1);


}