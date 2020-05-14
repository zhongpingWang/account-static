export default {

    props: {

        callback: {
            type: Function
        },

        len: {
            type: Number
        }
    },

    data() {
        return {
            isPass: false,
            verCode: "",
            txtCode: ""
        }
    },

    methods: {



        //刷新code
        _refreshCode() {
            this.verCode = this._genCode();
        },

        //生成code
        _genCode() {

            let code = "";

            //验证码的长度
            const codeLength = this.len || 4;

            ////所有候选组成验证码的字符，当然也可以用中文的
            const codeChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
            ];

            //循环组成验证码的字符串
            for (let i = 0; i < codeLength; i++) {
                //获取随机验证码下标
                const charNum = Math.floor(Math.random() * 62);
                //组合成指定字符验证码
                code += codeChars[charNum];
            }

            return code;

        },

        //验证
        vailCode() { 

            //获取显示区生成的验证码
            const checkCode = this.txtCode;
            //获取输入的验证码
            const inputCode = this.verCode;


            let returnObj;

            if (checkCode.length <= 0) {
                returnObj = {
                    code: 1,
                    msg: "请输入验证码！"
                }

            } else if (inputCode.toUpperCase() != checkCode.toUpperCase()) {

                returnObj = {
                    code: 1,
                    msg: "验证码输入有误！"
                }

            } else {
                returnObj = {
                    code: 0,
                    msg: "验证码正确！"
                }
            }


            returnObj.refreshCode = this._refreshCode;

            return returnObj;
        }

    },

    created() {
        this.verCode = this._genCode();
    }


}