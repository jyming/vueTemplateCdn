<template>
  <div class="loading" v-show="$store.state.loading">
    <van-loading size="1.2rem" />
  </div>
</template>
<script>
export default {
  name: 'Loading'
}
</script>
<style lang="less" scoped>
.loading {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 9;
  .bgf;
  .van-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
