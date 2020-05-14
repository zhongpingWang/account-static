<template>
<div id="userSite"> 

    <div class="leftNav">
        <ul>
            <li class="item ThemeCoolColorHover">个人信息</li>
            <li class="item ThemeCoolColorHover">我的设置</li>
            <li class="item ThemeCoolColorHover">我的应用</li>
        </ul>
    </div>

    <div class="content">
        <components :is="AccountStore.leftTabKey" />
    </div>

</div>
</template>

<script> 
import {mapActions,mapGetters} from "vuex"

import UserBase from "@/components/user/UserBase.vue"
import UserSettings from "@/components/user/UserSettings.vue"
import UserApps from "@/components/user/UserApps.vue"

export default {
    computed: {
        ...mapGetters({
            AccountStore:"AccountStore"
        })
    },
    components:{
        UserBase,
        UserSettings,
        UserApps
    }
}
</script>

<style lang="less" scoped>
#userSite { 
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: row;

    .leftNav {
        width: 300px;
        color: #555;
        font-size: 16px;
        border-right: 1px #ccc solid;
        .item{
            height: 40px;
            line-height: 40px;
            border-bottom: 1px #ccc solid;
            cursor: pointer;
        }
    }

    .content {

        flex: 1;
        background: #fff;

    }
}
</style>
