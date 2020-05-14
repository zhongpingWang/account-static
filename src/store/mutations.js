import * as Types from './mutationTypes'

export default {

    //登陆
    [Types.LOGIN](state,data){
        state.UserInfo = data;
    }
}