<template>
  <div class="app-content">
    <van-empty class="empty" :description="description" v-show="description" />
    <div class="news pd" v-show="!description">
      <div class="news-head">
        <h1>{{ newsData.title }}</h1>
        <p>
          <span v-show="newsData.author">{{ newsData.author }}</span>
          {{ newsData.createTime }}
        </p>
      </div>
      <div class="news-text" v-html="newsData.content"></div>
    </div>
    <comment :post="cmData" v-if="showCom"></comment>
  </div>
</template>
<script>
import { getNewsData } from './api'
import comment from 'components/comment'

export default {
  name: 'News',
  components: { comment },
  data() {
    return {
      newsId: this.$route.params.id,
      showEmpty: false,
      showCom: false,
      description: '',
      newsData: {},
      cmData: {}
    }
  },
  created() {
    this.getNewsData()
  },
  methods: {
    getNewsData() {
      getNewsData(this.newsId).then((res) => {
        if (res.code === 'P00000') {
          let newsData = res.data
          if (newsData) {
            document.title = newsData.title
            this.newsData = newsData
            this.cmData = {
              id: this.newsId
            }
            this.showCom = true
          } else {
            this.description = '该资讯不存在'
          }
        } else {
          this.description = res.msg
        }
        this.$api.loading(false)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.empty {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
.news-head {
  width: 100%;
  padding-top: 0.8rem;

  span {
    margin-right: 10px;
  }

  h1 {
    font-size: 20px;
    font-weight: bold;
    line-height: 30px;
    color: #141414;
  }

  p {
    font-size: 14px;
    color: #999;
    margin-top: 0.53rem;
  }
}

.news-text {
  width: 100%;
  padding-top: 0.6rem;
  font-size: 16px;
  line-height: 24px;

  * {
    max-width: 100% !important;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-color: grey;
    box-sizing: border-box;

    td {
      padding: 5px 10px;
      border: 1px solid #ddd;
    }
  }

  iframe {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 100% !important;
    overflow: hidden;
  }

  video {
    background-color: #333;
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 100% !important;
  }

  ul {
    padding: 0;
  }
}
</style>
