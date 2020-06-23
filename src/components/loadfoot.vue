<template>
  <div class="loadfoot">
    <div class="status" v-show="!hideLoad">
      <i class="infinite-loading-container"></i>
    </div>
    <p v-if="hideLoad">没有更多了</p>
  </div>
</template>
<script>
export default {
  name: 'loadfoot',
  props: ['hideLoad']
}
</script>
<style scoped>
.loadfoot {
  text-align: center;
}

.status i {
  display: inline-block;
  margin: 15px 0; /*no*/
  width: 28px; /*no*/
  height: 28px; /*no*/
  font-size: 28px; /*no*/
  line-height: 28px; /*no*/
  border-radius: 50%;
  border: 2px solid #777; /*no*/
  border-right-color: transparent;
  -webkit-animation: loading-rotating linear 0.85s infinite;
  animation: loading-rotating linear 0.85s infinite;
}

p {
  color: #666;
  font-size: 14px; /*no*/
  text-align: center;
  padding: 10px 0; /*no*/
}

@-webkit-keyframes loading-rotating {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }

  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}

@keyframes loading-rotating {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }

  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
</style>
