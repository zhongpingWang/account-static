<template>
<div id="homeSite">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->

    <div class="leftNav">
        leftNav
    </div>

    <div class="content">
        leftNav
    </div>

</div>
</template>

<script>
// @ is an alias to /src

export default {
    name: 'Home'
}
</script>

<style lang="less" scoped>
#homeSite {
    background: #000;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: row;

    .leftNav {
        width: 300px;
        background: #fff;
    }

    .content {

        flex: 1;
        background: blue;

    }
}
</style>
