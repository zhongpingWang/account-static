import * as Types from './mutationTypes'
import $http from '../api/http'


export default {
    //登陆
    register({ commit }, params) {

        $http.post({

            URLType: "register",

            data: params.data,

            callback: function (data) {

                if (data.code == 0) { 
                    params.callback && params.callback(data);
                } else {
                    params.callback && params.callback(data);
                }
            }

        });

    },

    //登陆
    login({ commit }, params) {

        $http.post({

            URLType: "login",

            data: params.data,

            callback: function (data) {

                if (data.code == 0) {
                    commit(Types.LOGIN, data);
                    params.callback && params.callback(data);
                } else {
                    params.callback && params.callback(data);
                }
            }

        });

    }
}