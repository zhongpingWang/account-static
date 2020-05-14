import Vue from 'vue'
import AppVue from './App.vue'
import router from './router'
import store from './store'
import _$ from "jquery"

window.$ = window.jQuery = _$;

Vue.config.productionTip = false

window.App = {};

import "@/global/css/index.less";
import "@/theme/default/index.less"
import "@/font/iconfont.css"

import VerificationCode from "@/shared/components/verificationCode/VerificationCode.vue"
Vue.component("VerificationCode",VerificationCode);

import Loading from "@/shared/components/loading/Loading.vue"
Vue.component("Loading",Loading);


import Dialog from "@/shared/components/dialog/Index.js"
import Tip from "@/shared/components/tip/Index.js"
 
 
App.Plugin = {
  Dialog,
  Tip
}

App.logger = console.log;


new Vue({
  router,
  store,
  render: h => h(AppVue)
}).$mount('#app')
