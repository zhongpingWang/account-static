import Vue from 'vue'
import Vuex from 'vuex'
import actions from "./actions"
import mutations from "./mutations"


Vue.use(Vuex)

export default new Vuex.Store({
  getters: {
    AccountStore: state => state, 
  },
  state: {
    UserInfo: false,
    leftTabKey:"UserApps"
  },
  mutations,
  actions
})