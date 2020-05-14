import Vue from "vue"

import ShowLoadingVue from "./ShowLoading"

let ShowLoadingConstructor = Vue.extend(ShowLoadingVue);

let LoadingIntances = [];



export function ShowLoading(params) {

    if (!params) {
        params = {};
    }

    let index = LoadingIntances.length;
    
    //全局的只能存在一个
    if (index > 0) { 

        if(params.loadingText){
            LoadingIntances[index-1].Settings.updateMessage(params.loadingText);
        }
 
        return;
    }

    //params -> //okCb  text canelCb


    let ShowLoadingDialog = App.Plugin.Dialog({

        cssClass: "showLoading",

        message: false,

        showHeader: false,

        showFooter: false,

        loadingText: params.loadingText || "数据加载中，请稍候…",

        MarkStyle: {
            'z-index': 2100
        },

        isNotAnimate: true,

        canelCb: (type) => {

            if (type == "esc") {
                return false;
            }

        },

        Warpstyle: {
            'z-index': 2101,
        },

        style: {

            width: '320px',
            height: '200px'
        },

        Constructor: ShowLoadingConstructor

    });

    LoadingIntances.push(ShowLoadingDialog);

    let soureClse = ShowLoadingDialog.close;

    //关闭
    ShowLoadingDialog.close = function(){
        LoadingIntances.pop();
        soureClse();
    }

    return ShowLoadingDialog;

}


export function HideLoading(){

    if(LoadingIntances.length > 0){
        LoadingIntances.pop().close();
    }
    
}

 