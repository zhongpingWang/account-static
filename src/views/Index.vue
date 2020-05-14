<template>
<div class="siteHome">

    <!-- <div class="bg1"> </div> -->
    <div class="bg2"> </div>

    <a class="login" href="/login">登录</a>

</div>
</template>

<style lang="less" scoped>
.siteHome {
    height: 100%;

    .bg1 {
        background: url(../assets/test/sun.jpg) no-repeat;
        height: 400px;
    }

    .bg2 {
        background: url(../assets/test/w.jpg) no-repeat center center;
        height: 100%;
    }

    .login{
        position: absolute;
        right:18px;
        top:16px;
        font-size: 18px;
        color: #fff; 
        text-decoration: none;
    }
}
</style>
