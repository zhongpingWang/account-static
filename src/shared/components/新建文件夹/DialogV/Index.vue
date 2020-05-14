<template>
<div class="dialogSite" :class="[Settings.cssClass]">

    <div class="myDialogMask" v-if="Settings.showMask" :style="Settings.MarkStyle"></div>

    <div class="myDialogWapper" :style="Settings.Warpstyle">

        <div class="myDialog" :class="[Settings.cssClass]" :style="Settings.style">

            <div class="dialogHeader" v-if="Settings.showHeader">
                <i class="commoniconfont icon-close16 ThemeDarkColorHover btnClose" @click="_close"></i>
                <span class="title">{{Settings.title}}</span>
            </div>

            <div class="dialogBody">
                <div v-if="Settings.message" v-html="Settings.message"></div>
                <div v-if="Settings.Constructor" class="DConstructor"></div>
            </div>

            <div class="dialogFooter" v-if="Settings.showFooter">
                <span class="btn" @click="_close">取消</span>
                <span class="btn primary btnEnter" @click="_enter">确定</span>
            </div>

        </div>

    </div>

</div>
</template>

<script>
import store from '../../Store'

export default {

    props: ["Settings"],

    methods: {

        //关闭
        _close() {

            var result = true;

            if (this.Settings.canelCb) {
                result = this.Settings.canelCb();
            }

            if (result == false) {
                return;
            }

            this.close();
        },

        //确定
        _enter() {

            var result = true;

            if (this.Settings.okCb) {
                result = this.Settings.okCb();
            }

            if (result == false) {
                return;
            }

            this.close();
        },

    },


    mounted() {

        if (this.Settings.Constructor) { 

            this.Settings.close = this.close;

            let instance = new this.Settings.Constructor({
                store,
                propsData: {
                    Settings: this.Settings
                }
            });

            //实例化
            instance.vm = instance.$mount();

            this.$nextTick(function () {

                $(this.$el).find(".DConstructor").append(instance.vm.$el);

                let sourceClose = this.close;

                this.close = function (isAnimate, isNotCallabck) { 
                    isAnimate = false
                    //这里是 如果 手动返回 false 在 关闭的时候 是否回调 看 参数了 如果没有返回 false  就 直接 关闭了 
                    if (!isNotCallabck) {

                        let result = this.Settings.canelCb && this.Settings.canelCb();

                        if (result == false) {
                            return;
                        }
                    } 
                    instance.$destroy(true);
                    //元素 如果提前移除 动画里面 是空白的 dialog 移除的时候 元素 也会 移除 这里 就 不做 移除了
                    //instance.$el.parentNode && instance.$el.parentNode.removeChild(instance.$el);

                    //关闭回调已经 调用过了 不需要在回调了
                    sourceClose(isAnimate, true);
                }

            });

        }

    },
};
</script>

<style lang="less" scoped>
.myDialogMask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    background: #000;
    z-index: 1999;
}

.myDialogWapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    margin: 0;
    z-index: 2000;
}

.myDialog {
    position: relative;
    margin: 0 auto 50px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    margin-top: 15vh;
    width: 30%;

    .btnClose {
        float: right;
        color: #ccc;
        font-weight: bold;
        cursor: pointer;
    }

    .dialogHeader {
        padding: 20px 20px 10px;
        border-bottom: 1px #ccc solid;

        .title {
            line-height: 24px;
            font-size: 18px;
            color: #303133;
        }
    }

    .dialogBody {
        color: #606266;
        font-size: 14px;
        word-break: break-all;
    }

    .dialogFooter {
        padding: 10px 20px 20px;
        text-align: right;
        box-sizing: border-box;

        .btnEnter {
            margin-left: 10px;
        }
    }
}
</style>
