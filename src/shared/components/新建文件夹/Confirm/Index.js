import Vue from "vue"

import Confirm from "./Confirm"

let ConfirmConstructor = Vue.extend(Confirm);

export default function (params) {

    //params -> //okCb  text canelCb


    let ConfirmDialog = App.Plugin.Dialog({

        cssClass: "conformComponentDialog " + params.className || '',

        message: false,

        showHeader: false,

        showFooter: false,

        okText: params.okText ||  LAN.lan_1504809,

        canelText: params.canelText || LAN.lan_1504810,

        tipText: params.text || '说点啥吧！',

        placeholder:params.placeholder || '',

        subText: params.subText || false,

        showInput: params.showInput || false,

        okCb: (parObjs) => {
             
            let result = params.okCb && params.okCb(parObjs);

            if (result != false) {
                ConfirmDialog.close(false, true);
            }

            return result;
        },

        canelCb: (type) => {

            let result = params.canelCb && params.canelCb(type);

            if (result != false) {
                ConfirmDialog.close(false, true);
            }

            return result;
        },

        MarkStyle: params.MarkStyle || {
            'z-index': 2000
        },

        style: params.style || {
            'z-index': 2001,
            width: '320px',
            height: '200px'
        },

        Constructor: params.Constructor || ConfirmConstructor

    });


    return ConfirmDialog;

}