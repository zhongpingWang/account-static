<template>
<div id="login">

    <div id="loginDialog">

        <div class="title">用户注册</div>

        <div class="item">
            <div class="tip">用户名</div>
            <input v-model="txtAccount" type="text" placeholder="请输入用户名" class="txtInput txtAccount" />

        </div>

        <div class="item">
            <div class="tip">密码</div>
            <input v-model="txtPwd" type="password" placeholder="请输入密码" class="txtInput txtPwd" />
        </div>

        <div class="item">
            <div class="tip">确认密码</div>
            <input v-model="txtPwdEnter" type="password" placeholder="请输入密码" class="txtInput txtPwdEnter" />
        </div>

        <div class="item">
            <div class="tip">验证码</div>
            <VerificationCode ref="VerificationCode" :callback="_execVerCode"></VerificationCode>
        </div>

        <div class="item">

            <div class="btnLogin btn btnPrimary" @click="_register">注册</div>

        </div>

        <div class="item">

            <span>已有账号？</span>

            <router-link to="/login">
                <a>请登录</a>
            </router-link>

        </div>

    </div>

</div>
</template>

<script>
import {
    mapActions,
    mapGetters
} from "vuex"

export default {

    data() {
        return {
            txtPwd: "",
            txtPwdEnter: "",
            txtAccount: ""
        }
    },
    methods: {

        ...mapActions({
            register: "register"
        }), 
      
        //登陆
        _register() {

            if (!this.txtAccount.trim()) {
                App.Plugin.Tip.error("请输入用户名！");
                $(".txtAccount").focus();
                return;
            }

            if (!this.txtPwd.trim()) {
                App.Plugin.Tip.error("请输入密码！");
                $(".txtPwd").focus();
                return;
            }

            if (!this.txtPwdEnter.trim()) {
                App.Plugin.Tip.error("请确认密码！");
                $(".txtPwdEnter").focus();
                return;
            }

            if (this.txtPwdEnter.trim() != this.txtPwd.trim()) {
                App.Plugin.Tip.error("两次输入的密码不一致！");
                $(".txtPwdEnter").focus();
                return;
            }
            //
            const _rData = this.$refs.VerificationCode.vailCode();

            if (_rData.code != 0) {

                App.Plugin.Tip.error(_rData.msg);
                _rData.refreshCode();
                $(".txtCode").focus();
                return;
            }

            this.register({
                data: {
                    account: this.txtAccount,
                    passWord: this.txtPwd
                },
                callback: (data) => {
                    if (data.code == 0) {
                        App.Plugin.Tip.success("注册成功！");

                        let timer = setTimeout(function () {
                            location.href = "/login";
                        }, 1000);
                    } else {
                        App.Plugin.Tip.error(data.message);
                    }
                }
            });

        }
    }
}
</script>

<style lang="less" scoped>
#login {
    background: url(../assets/login/bg.jpg);
    height: 100%;
    background-size: cover;

    .loginLogo {
        padding: 1% 2%;
    }
}

#checkCode {
    width: 115px;
}

#loginDialog {
    color: #fff;
    background: rgba(0, 0, 0, .35);
    position: fixed;
    top: 10%;
    right: 10%;
    padding: 30px 40px;
    border-radius: 5px;

    .title {
        font-size: 26px;
    }

    .reCode {
        font-size: 12px;
    }

    .tip {
        margin-bottom: 8px;
        font-size: 18px;
        text-align: left;
    }

    .txtInput {
        width: 320px;
    }

    .item {
        margin-top: 20px;
    }

    .txtCode {
        width: 107px;
    }

    .btnLogin {
        width: 100%;
        margin-top: 16px;
    }
}
</style>
