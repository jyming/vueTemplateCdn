<template>
  <div id="app">
    <loading />
    <router-view />
  </div>
</template>

<script>
import loading from 'components/loading'
export default {
  name: 'App',
  components: { loading },
  data() {
    return {}
  }
}
</script>
<style>
@import 'assets/style/public.less';
</style>
