<template>
<div class="showLoadingDialog">
    <div class="infos">
        <div class="loadingBg">
        </div>
        <div class="text"></div>
    </div>
</div>
</template>

<script>
export default {

    props: ['Settings'],

    mounted() {

        $(this.$el).find(".text").text(this.Settings.loadingText);

        this.Settings.updateMessage = (loadingText) => {

            $(this.$el).find(".text").text(loadingText);

        }

    }
}
</script>

<style lang="less">
.myDialog.showLoading {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    box-shadow: none;
    background: transparent;
}

.showLoadingDialog {

    .infos {
        padding-top: 34px;

    }

    .loadingBg {
        width: 65px;
        height: 70px;
        background: url(./loadinglogo.gif) no-repeat center center;
        background-size: cover;
        margin: 0 auto;
        margin-bottom: 12px;
    }

    .text {
        text-align: center;
        color: #999;
        font-size: 14px;
    }
}
</style>
