<template>
  <van-empty class="empty-error" image="error" description="该页面不存在" />
</template>
<script>
export default {
  name: 'Error',
  created() {
    this.$api.loading(false)
  }
}
</script>
<style scoped>
.empty-error {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
