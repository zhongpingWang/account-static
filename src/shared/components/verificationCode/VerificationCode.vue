<template>
<span class="VerificationCode">
    <span class="imgCode">{{verCode}}</span>
    <input v-model="txtCode" id="txtCode" placeholder="验证码" type="text" class="txtCode txtInput" />
    <a @click="_refreshCode" class="reCode">看不行，换一张</a>
</span>
</template>

<script>

import verificationCodeMixin from "./verificationCodeMixin"

export default {
 mixins: [verificationCodeMixin]
}
</script> 

<style lang="less">
.VerificationCode {
    .imgCode {
        font-family: Arial;
        font-style: italic;
        color: blue;
        font-size: 22px;
        border: 0;
        padding: 2px 3px;
        letter-spacing: 3px;
        font-weight: bolder;
        display: inline-block;
        cursor: pointer;
        width: 73px;
        height: 27px;
        line-height: 27px;
        text-align: center;
        vertical-align: top;
        background-size: contain;
        background: rgba(255, 255, 255, .4);
    }

    #txtCode {
        width: 135px;
        margin-left: 8px;
        margin-right: 8px;
        height: 31px;
    }

    .reCode {
        cursor: pointer;
        font-size: 12px;
    }
}
</style>
