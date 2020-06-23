<template>
  <div class="comment" :class="{ zindex: zindex }">
    <!-- 浏览量点赞量 -->
    <div class="swlen pd" v-if="!post.hideZ">
      <!-- <div class="brows">浏览量 {{post.visitation}}</div> -->
      <div class="brows"></div>
      <div class="zan" @click="zan">
        <span>
          <img :class="{ active: !isZan }" src="../assets/image/icon_z1.png" />
          <img :class="{ active: isZan }" src="../assets/image/icon_z2.png" />
        </span>
        {{ zanNum }}
      </div>
    </div>
    <!-- 评论列表 -->
    <div class="comment-main pd">
      <div class="comment-cont">
        <div class="comment-title">
          <p>
            全部评论
            <span v-show="plNum > 0">({{ plNum }})</span>
          </p>
          <span class="bindPl" v-if="post.pb" @click="showInput">
            <img src="../assets/image/icon_pl.png" />
            评论
          </span>
        </div>
        <div class="comment-list">
          <div class="comment-item" v-for="item of discuss" :key="item.id">
            <div class="avatar img-warp">
              <img
                :src="
                  item.creatorUserHeadLog ||
                  require('../assets/image/tx_02.png')
                "
              />
            </div>
            <div class="comment-text">
              <h3>{{ item.id }}</h3>
              <p @click="onReply(item)">{{ item.discontent }}</p>
              <div class="comment-time">{{ item.createTime }}</div>
            </div>
            <div
              class="reply-list"
              v-if="item.reply && item.reply.length > 0"
              @click="showReply(item)"
            >
              <div
                class="reply-item"
                v-for="reply of item.reply"
                :key="reply.id"
              >
                <p>
                  <span>{{ reply.creatorUserName }}</span>
                  <b
                    v-html="
                      reply.pid == item.id
                        ? '：' + reply.content
                        : '回复<span style=\'color: #3d5699;\'>@' +
                          reply.objectName +
                          '</span>：' +
                          reply.content
                    "
                  ></b>
                </p>
              </div>
              <div
                class="reply-item"
                v-if="item.reply && item.reply.length >= 3"
              >
                <p>
                  <span>查看更多回复</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- 加载状态 -->
        <infinite-loading
          :identifier="infiniteId"
          @infinite="infiniteHandler"
          spinner="spiral"
          forceUseInfiniteWrapper="body"
        >
          <div slot="no-more" class="nomore">没有更多了</div>
          <div slot="no-results" class="nomore">没有更多了</div>
        </infinite-loading>
      </div>
    </div>
    <!-- 评论框 -->
    <div class="comment-box" :style="{ height: focus }">
      <div class="input-main">
        <input
          type="text"
          v-model="replyData.content"
          :placeholder="placeholder"
          ref="inputOne"
          @focus="focusSet(1)"
          @blur="focusSet(0)"
          @touchstart="tapStart($event)"
          @touchend="tapEnd($event)"
        />
      </div>
      <div class="comment-send" @click="sendOne">发送</div>
    </div>
    <div class="stop-move" v-show="shows" @click.prevent="clearState"></div>
    <!-- 回复列表弹出层 -->
    <div class="mask-layer" v-show="layshow"></div>
    <transition name="slide">
      <div class="reply-content" v-show="layshow">
        <div class="reply-top" @touchmove.prevent @click="hideReply"></div>
        <div class="reply-head" @touchmove.prevent>
          <div class="reply-title">全部{{ hfNum }}条回复</div>
          <div class="img-warp" @click="hideReply">
            <img src="../assets/image/icon_gb.png" />
          </div>
        </div>
        <div class="comment-list pd" ref="wrapper">
          <div class="wrapper-scroll">
            <div class="comment-item" v-for="item of replyList" :key="item.id">
              <div class="avatar img-warp">
                <img
                  :src="
                    item.creatorUserHeadLog ||
                    require('../assets/image/tx_02.png')
                  "
                />
              </div>
              <div class="comment-text">
                <h3>{{ item.creatorUserName }}</h3>
                <p
                  @click="onHf(item)"
                  v-html="
                    item.pid == replyId
                      ? item.content
                      : '回复<span style=\'color: #3d5699;\'>@' +
                        item.objectName +
                        '</span>：' +
                        item.content
                  "
                ></p>
                <div class="comment-time">{{ item.showTime }}</div>
              </div>
            </div>
            <loadfoot :hideLoad="hideLoad"></loadfoot>
          </div>
        </div>
        <div
          class="stop-move"
          @touchmove.prevent
          v-show="shows"
          @click="clearHfState(0)"
        ></div>
        <!-- 回复框 -->
        <div class="comment-box" @touchmove.prevent :style="{ height: focus }">
          <div class="input-main">
            <input
              type="text"
              v-model="hftext"
              :placeholder="placeholder"
              ref="inputTwo"
              @focus="focusSet(1)"
              @blur="focusSet(0)"
              @touchstart="tapStart($event)"
              @touchend="tapEnd($event)"
            />
          </div>
          <div class="comment-send" @click="sendTwo">发送</div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import request from 'request'
import BScroll from 'better-scroll'
import loadfoot from '@/components/loadfoot'
import InfiniteLoading from 'vue-infinite-loading'
export default {
  name: 'comment',
  components: {
    loadfoot,
    InfiniteLoading
  },
  props: ['post'],
  data() {
    return {
      move: 0,
      zindex: false,
      isState: false,
      zanClick: false, //是否可以点赞
      infiniteId: +new Date(),
      login: true, //是否登录
      zanNum: 0, //点赞量
      isZan: false, //是否点赞
      zatime: 0, //点赞时间
      sid: '', //定时器
      plpage: 0, //评论页码
      plNum: 0, //评论数量
      discuss: [], //评论列表
      placeholder: '说点什么吧', //评论框提示文字
      userData: { userId: 1 },
      replyData: {
        discussId: 0,
        headLog: '',
        discussName: this.post.title,
        content: ''
      }, //评论参数
      shows: false, //遮罩层显隐
      layshow: false, //回复列表弹出层显隐
      scroll: '', //滚动层对象
      hfNum: 0, //回复数量
      replyId: '', //回复id
      replyList: [], //回复列表
      hftext: '', //回复文字
      hideLoad: false, //回复加载状态
      focus: this.$api.versions.ios
        ? 'calc(1.31rem + env(safe-area-inset-bottom))'
        : '1.31rem', //输入框获取焦点状态
      hfData: {
        discussId: 0,
        headLog: '',
        discussName: ''
      }, //回复参数
      hfsData: {
        discussId: 0,
        headLog: '',
        discussName: ''
      }, //二级回复参数
      change: 0
    }
  },
  mounted() {
    var wrapper = this.$refs.wrapper
    this.scroll = new BScroll(wrapper, {
      click: true,
      bounce: false,
      pullUpLoad: {
        threshold: 100
      },
      scrollbar: {
        fade: true,
        interactive: false
      }
    })
  },
  methods: {
    // 获取点赞数量
    getDzNum() {
      request({
        method: 'get',
        url:
          this.$store.state.baseUrl +
          '/app-api/application/praise/count/' +
          this.post.type +
          '/' +
          this.post.id
      })
        .then((res) => {
          this.zanNum = res.data.data
        })
        .catch((e) => {
          console.log(e)
        })
    },
    //   获取点赞状态
    getDzState() {
      if (!this.login) {
        return
      }
      request({
        method: 'get',
        url:
          this.$store.state.baseUrl +
          '/app-api/application/praise/records/user/praise/' +
          this.post.type,
        params: {
          itemId: this.post.id,
          userId: this.userData.userId
        }
      })
        .then((res) => {
          this.isZan = res.data.data
          this.zanClick = true
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 点赞
    zan() {
      if (!this.login) {
        this.$api.jumpLogin(() => {
          var fullPath = this.$route.fullPath
          this.$router.push({
            path: '/login',
            query: {
              fullPath: fullPath
            }
          })
        })
        return
      }
      if (!this.zanClick) return
      if (this.isZan) {
        this.zanNum = this.zanNum * 1 - 1
        this.isZan = false
      } else {
        this.zanNum = this.zanNum * 1 + 1
        this.isZan = true
      }
      this.$nextTick(() => {
        this.zatime = new Date().getTime()
        if (!this.sid) {
          this.sid = setInterval(() => {
            var time = new Date().getTime()
            if (time - this.zatime >= 900) {
              request({
                method: 'post',
                url:
                  this.$store.state.baseUrl +
                  '/app-api/application/praise/single/praise',
                data: {
                  itemId: this.post.id,
                  itemTitle: this.post.title,
                  status: this.isZan ? 1 : 0,
                  type: this.post.type,
                  userId: this.userData.userId,
                  userName: this.userName
                }
              })
                .then((res) => {
                  //   console.log(res);
                })
                .catch((err) => {
                  console.log(err)
                })
              clearInterval(this.sid)
              this.sid = ''
            }
          }, 900)
        }
      })
    },
    // 获取评论列表
    infiniteHandler($state) {
      request({
        method: 'get',
        url: '/api/discuss/getDiscuss',
        params: {
          serialNo: this.post.id,
          page: this.plpage,
          limit: 7
        }
      })
        .then((res) => {
          if (res.code == 'P00000') {
            var discuss = res.data.records
            if (!discuss) {
              $state.complete()
              return
            }
            this.plNum = res.data.total
            this.discuss.push(...discuss)
            if (discuss.length < 7) {
              this.$nextTick(() => {
                $state.complete()
              })
            } else {
              this.plpage += 1
              this.$nextTick(() => {
                $state.loaded()
              })
            }
          } else {
            $state.complete()
          }
        })
        .catch((err) => {
          $state.complete()
        })
    },
    // 获取回复列表
    getReply(discussId) {
      request({
        method: 'get',
        url: this.$store.state.baseUrl + '/app-api/application/discuss',
        params: {
          objectId: this.post.id,
          discussId: discussId,
          type: this.post.type,
          limit: 8,
          page: 1
        }
      })
        .then((res) => {
          if (res.data.code == 'P00000') {
            var data = res.data.data
            this.hfNum = data.replyCount
            this.replyList = data.discuss[0].reply
            this.$nextTick(() => {
              this.scroll.refresh()
              this.hideLoad = true
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 提交评论
    sendOne() {
      if (!this.login) {
        this.$api.jumpLogin(() => {
          var fullPath = this.$route.fullPath
          this.$router.push({
            path: '/login',
            query: {
              fullPath: fullPath
            }
          })
        })
        return
      }
      var replyData = this.replyData
      if (
        replyData.content.match(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g)
      ) {
        vant.Toast('请不要输入表情符号')
        return
      }
      if (!replyData.content) {
        vant.Toast('评论不能为空')
        return
      } else if (replyData.content.length > 200) {
        vant.Toast('超过字数限制')
        return
      }
      this.$store.commit('changeState', {
        stateName: 'changeLoad',
        boolean: true
      })
      var discussId = replyData.discussId
      request({
        method: 'post',
        url: '/api/discuss/createDiscuss',
        params: {
          userId: this.userData.userId,
          serialNo: this.post.id,
          parentId: discussId,
          userAvatar: replyData.headLog,
          discontent: replyData.content
        }
      })
        .then((res) => {
          if (res.code === 'P00000') {
            if (discussId == 0) {
              this.plpage = 0
              this.discuss = []
              this.infiniteId += 1
            } else {
              var discuss = this.discuss
              for (let i = discuss.length; i--; ) {
                if (discuss[i].id == discussId) {
                  discuss[i].reply.push({
                    content: replyData.content,
                    id: new Date().getTime(),
                    creatorUserName: this.userName,
                    pid: discussId
                  })
                }
              }
            }
            this.clearState()
          } else {
            if (res.msg) {
              vant.Toast(res.msg)
            } else {
              vant.Toast('网络波动')
            }
          }
          this.$store.commit('changeState', {
            stateName: 'changeLoad',
            boolean: false
          })
        })
        .catch((err) => {
          vant.Toast('网络波动')
          this.$store.commit('changeState', {
            stateName: 'changeLoad',
            boolean: false
          })
        })
    },
    // 一级评论
    onReply(params) {
      this.replyData = {
        discussId: params.id,
        headLog: this.userData.userIcon,
        discussName: params.creatorUserName,
        content: ''
      }
      this.placeholder = '回复' + params.creatorUserName
      this.shows = true
      this.zindex = true
      this.$refs.inputOne.focus()
    },
    // 清理状态
    clearState() {
      this.replyData = {
        discussId: 0,
        headLog: this.userData.userIcon,
        discussName: this.post.title,
        content: ''
      }
      this.placeholder = '说点什么吧'
      this.shows = false
      this.zindex = false
    },
    // 显示评论弹出层
    showReply(params) {
      this.layshow = true
      if (this.replyId != params.id) {
        this.$nextTick(() => {
          this.scroll.scrollTo(0, 0, 0)
        })
        this.hfNum = 0
        this.replyList = []
        this.replyId = params.id
        this.hideLoad = false
        this.hfData = {
          discussId: params.id,
          headLog: this.$store.state.userData.userIcon,
          discussName: params.creatorUserName
        }
      }
      this.placeholder = '回复' + params.creatorUserName
      this.getReply(params.id)
    },
    // 隐藏评论弹出层
    hideReply() {
      this.clearHfState('说点什么吧')
      this.layshow = false
    },
    // 回复
    onHf(params) {
      this.change = 1
      this.hfsData = {
        discussId: params.id,
        headLog: this.$store.state.userData.userIcon,
        discussName: params.creatorUserName
      }
      this.placeholder = '回复' + params.creatorUserName
      this.shows = true
      this.$refs.inputTwo.focus()
    },
    // 清理回复参数
    clearHfState(text) {
      this.hfsData = {
        discussId: 0,
        headLog: this.$store.state.userData.userIcon,
        discussName: ''
      }
      this.hftext = ''
      this.placeholder = text || '回复' + this.hfData.discussName
      this.shows = false
      this.change = 0
    },
    sendTwo() {
      if (!this.login) {
        this.$api.jumpLogin(() => {
          var fullPath = this.$route.fullPath
          this.$router.push({
            path: '/login',
            query: {
              fullPath: fullPath
            }
          })
        })
        return
      }
      if (this.hftext.match(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g)) {
        vant.Toast('请不要输入表情符号')
        return
      }
      if (!this.hftext) {
        vant.Toast('回复不能为空')
        this.$refs.inputTwo.focus()
        return
      } else if (this.hftext.length > 200) {
        vant.Toast('超过字数限制')
        return
      }
      this.$store.commit('changeState', {
        stateName: 'changeLoad',
        boolean: true
      })
      var datas = this.change ? this.hfsData : this.hfData
      request({
        method: 'post',
        url: this.$store.state.baseUrl + '/app-api/application/discuss',
        params: {
          userId: this.userData.userId,
          userName: this.userName,
          objectId: this.post.id,
          type: this.post.type,
          discussId: datas.discussId,
          headLog: datas.headLog,
          discussName: datas.discussName,
          content: this.hftext
        }
      }).then((res) => {
        if (res.data.code == 200) {
          this.getReply(this.replyId)
          this.clearHfState()
          this.$store.commit('changeState', {
            stateName: 'changeLoad',
            boolean: false
          })
        }
      })
    },
    showInput() {
      this.zindex = true
      this.$refs.inputOne.focus()
    },
    tapStart(e) {
      this.move = e.changedTouches[0].clientX
    },
    tapEnd(e) {
      var move = e.changedTouches[0].clientX
      if (this.move == move) {
        e.target.focus()
      }
    },
    focusSet(status) {
      this.shows = true
      if (this.$api.versions.ios) {
        this.focus = status
          ? '1.31rem'
          : 'calc(1.31rem + env(safe-area-inset-bottom))'
      }
    },
    addIntegral() {
      request({
        method: 'get',
        url:
          this.$store.state.baseUrl +
          '/app-api/application/information/push/' +
          this.post.type +
          '/' +
          this.post.id +
          '?title=' +
          encodeURIComponent(this.post.title)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.comment {
  width: 100%;
  padding-bottom: 2rem;
  margin-bottom: env(safe-area-inset-bottom);
  .swlen {
    font-size: 0.36rem;
    color: #999;
    display: flex;
    justify-content: space-between;
    line-height: 0.8rem;
    margin-bottom: 0.27rem;
    .zan {
      span {
        width: 0.45rem;
        height: 0.43rem;
        display: inline-block;
        vertical-align: middle;
        margin-right: 0.1rem;
        position: relative;
        top: -0.08rem;
        img {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          display: block;
        }
        img.active {
          opacity: 1;
        }
      }
    }
  }
  .comment-main {
    width: 100%;
    padding-top: 0.48rem;
    border-top: 0.27rem solid #f7f7f7;
    box-sizing: border-box;
  }
  .comment-title {
    line-height: 0.67rem;
    font-size: 0.45rem;
    color: #141414;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    font-family: PingFangSC-Semibold, sans-serif;
  }
}

.comment-list {
  width: 100%;
  padding-bottom: 0.5rem;
}

.comment-item {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1.12rem;
  position: relative;
}

.comment-item:after {
  content: '';
  display: block;
  width: 100%;
  left: 0;
  bottom: 0;
  height: 1px;
  position: absolute;
  background-color: #f1f1f1;
  transform: scaleY(0.5);
}

.avatar {
  width: 0.8rem;
  height: 0.8rem;
  position: absolute;
  left: 0;
  top: 0.5rem;
  border-radius: 50%;
  img {
    object-fit: cover;
  }
}

.comment-text h3 {
  line-height: 0.8rem;
  font-size: 0.4rem;
  color: #666;
}

.comment-text p {
  width: 100%;
  margin-top: 0.2rem;
  font-size: 0.4rem;
  line-height: 0.53rem;
  color: #353535;
}

.comment-time {
  font-size: 0.32rem;
  color: #666;
  margin-top: 0.4rem;
}

.reply-list {
  width: 100%;
  padding: 0.43rem 0.37rem 0.16rem;
  background-color: #f7f7f7;
  margin-top: 0.27rem;
}

.reply-item {
  width: 100%;
  font-size: 0.37rem;
  line-height: 0.53rem;
  color: #141414;
  margin-bottom: 0.27rem;
  b {
    font-weight: normal;
  }
}

.reply-list span {
  color: #3d5699;
}

.comment-box {
  width: 100%;
  height: 1.31rem;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 9;
  background-color: #fff;
  padding-left: 0.43rem;
  box-sizing: border-box;
  border-top: 1px solid #f1f1f1;
  height: calc(1.31rem + env(safe-area-inset-bottom));
  input,
  .comment-send {
    background-color: #fff;
    font-size: 0.37rem;
    color: #0a0a0a;
  }

  input {
    display: block;
    width: 100%;
    height: 0.95rem;
    line-height: 0.95rem;
    background-color: #f8f8f8;
    border: 0;
    outline: none;
    padding: 0 0.3rem;
    box-sizing: border-box;
    font-size: 0.37rem;
    border-radius: 0.95rem;
    margin-top: 0.17rem;
  }

  .comment-send {
    position: absolute;
    width: 1.6rem;
    height: 1.31rem;
    right: 0;
    top: 0;
    z-index: 2;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.input-main {
  width: 100%;
  height: 100%;
  padding-right: 1.6rem;
  overflow: hidden;
}

.nomore {
  color: #ccc;
  font-size: 14px;
}

.stop-move {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 8;
}

.reply-content {
  position: fixed;
  width: 100%;
  height: 75%;
  left: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 11;
  .comment-list {
    position: absolute;
    z-index: 2;
    top: 1rem;
    bottom: 1.31rem;
    bottom: calc(1.31rem + env(safe-area-inset-bottom));
    left: 0;
    overflow: hidden;
  }
  .stop-move {
    position: absolute;
    top: 1rem;
  }
  .comment-box {
    position: absolute;
  }
}

.reply-top {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  bottom: 100%;
  z-index: 1;
}

.reply-head {
  width: 100%;
  position: relative;
  z-index: 2;
}

.reply-title {
  height: 1rem;
  line-height: 1rem;
  font-size: 0.4rem;
  color: #141414;
  text-align: center;
  border-bottom: 1px solid #f1f1f1;
}

.reply-head .img-warp {
  width: 1rem;
  height: 1rem;
  position: absolute;
  right: 0.13rem;
  top: 0;
  display: flex;
  img {
    width: 60%;
    height: 60%;
    margin: auto;
  }
}

.mask-layer {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(0, 100%, 0);
}

.bindPl {
  color: #3d5699;
  display: flex;
  align-items: center;
  font-family: PingFangSC-Regular, sans-serif;

  img {
    width: 0.43rem;
    height: 0.43rem;
    vertical-align: middle;
    margin-right: 0.13rem;
  }
}

.zindex {
  position: relative;
  z-index: 999;
}
</style>
