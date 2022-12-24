<template>
  <div class="page-container">
    <!-- 背景颜色/背景图片 -->
    <div class="page-bgc"></div>

    <div class="page">
      <!-- 内容-容器 -->
      <div class="header"></div>
      <div class="content">
        <div
          class="game"
          ref="huntGameContainer"
          :style="`transform:${scaleAuto}`"
        ></div>
      </div>
      <div class="footer"></div>
    </div>
  </div>
</template>

<script>
import Game from './js/index.js';

export default {
  name: 'Layout',

  //变量区
  data() {
    return {
      test: '123',
      scaleAuto: 'scale(1)',
    };
  },
  //生命周期区
  mounted() {
    console.log(this.$refs.huntGameContainer, 'canvas');

    let width = 1200;
    let height = 769;
    const scale = `scale(${
      window.innerHeight < window.innerWidth
        ? window.innerHeight / height
        : window.innerWidth / width
    })`;
    this.scaleAuto = scale;

    // 我们自定义的类，放在js里面了

    this.$nextTick(() => {
      new Game({ appContainer: this.$refs.huntGameContainer }).init();
    });

    // console.log(this.$store);
    // this.JKTest();
  },
  //方法区
  methods: {
    JKTest() {
      console.log('测试一下');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
// 引入自定义字体
/* latin */
@font-face {
  font-family: 'Press Start 2P';
  font-style: normal;
  font-weight: 400;
  src: url('@/assets/Press Start 2P.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

.page-container {
  box-sizing: border-box;
  position: relative;
  //   height: fit-content;
  width: 100vw;
  height: 100vh;
  //   background-color: rgba(grey, 0.1);

  //不加的话 iphone5会多出来一块
  overflow-x: hidden;

  //   背景颜色/背景图片
  .page-bgc {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    //   background-image: url('@/assets/img/ready-step-bgc.jpg');
    //   background-size: 100% 100%;
    //   background-repeat: no-repeat;
  }

  .page {
    box-sizing: border-box;
    position: relative;
    //   height: fit-content;
    width: 100vw;
    height: 100vh;
    background-color: rgba(grey, 0.1);

    //不加的话 iphone5会多出来一块
    overflow-x: hidden;
    //   设置背景
    .content {
      height: 100%;
      width: 100%;
      .game {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 100%;
        /* width: 100%; */
      }
    }
  }
}
</style>
