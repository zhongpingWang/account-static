<template>
<div class="ConfirmDialog" :class="[Settings.cssClass]">
    <div class="mask"></div>

    <div class="infos">
        <i class="commoniconfont icon-shangchuanshibai"></i>
        <div class="text" :class="{title:Settings.subText}">{{Settings.tipText}}</div>
        <div class="subText" v-if="Settings.subText">
            {{Settings.subText}}
        </div>
    </div>

    <div class="textInput" v-if="Settings.showInput">
        <textarea maxlength="40" v-model="txtMask" :placeholder="Settings.placeholder" class="textarea"></textarea>
    </div>

    <div class="footer">
        <span class="btnEnter btnComm" @click="_enter">{{Settings.okText}}</span>
        <span class="btnCanel btnComm" @click="_canel">{{Settings.canelText}}</span>
    </div>

</div>
</template>

<script>
export default {

    props: ['Settings'],

    data() {

        return {
            txtMask: ""
        }
    },

    methods: {

        //确定
        _enter() {
            this.Settings.okCb && this.Settings.okCb({
                message:this.txtMask
            });
        },

        //取消
        _canel() {
            this.Settings.canelCb && this.Settings.canelCb();
        }
    }
}
</script>

<style lang="less">

.ConfirmDialog {

    &.stopTask {

        .infos {
            height: 106px;

            .text {
                color: #e6890b;
            }
        }

        .footer {
            border: 0;
        }
    }

    .infos {
        height: 135px;
        box-sizing: border-box;
        padding-top: 35px;

        .commoniconfont {
            float: left;
            margin-left: 35px;
            font-size: 32px;
            color: #e6890b;
        }

        .text {
            margin-left: 76px;
            font-size: 16px;
            margin-top: 3px;
            margin-right: 5px;
            min-height: 40px;
            display: flex;
            align-items: center;

            &.title {
                min-height: auto;
            }
        }

        .subText {
            margin-left: 76px;
            font-size: 12px;
            color: #a2a2a2;
        }
    }

    .textInput {
        margin-bottom: 8px;

        .textarea {
            width: 323px;
            height: 58px;
            margin-left: 33px;
            box-sizing: border-box;
            padding: 4px 5px;
        }
    }

    .footer {
        border-top: 1px solid #ccc;
        text-align: right;

        .btnComm {
            display: inline-block;
            width: 90px;
            margin-right: 20px;
            height: 30px;
            line-height: 30px;
            margin-top: 15px;
            border-radius: 3px;
            text-align: center;
            border: 1px #ccc solid;
            cursor: pointer;
            box-sizing: border-box;
        }

        .btnEnter {
            background: #e6890b;
            color: #fff;
            margin-right: 10px;
            border: none;
        }
    }
}
</style>
