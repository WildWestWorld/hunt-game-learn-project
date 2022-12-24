//引入pixi.js
import * as PIXI from "pixi.js";
//引入我们所需要资源文件链接
import assets from './assets'
import GameScene from "./gameScene";
import StartScene from "./startScene";
//用于存储/取出我们放入的素材
import { setTexture } from "./textures"
import { createAim } from "./aim"
import Bus from "@/utils/bus";

// 创建整个游戏的类
export default class Game {
    constructor(options = {}) {
        // APP的配置
        this.width = 1200;
        this.height = 769;

        // 这里我们只要设置div就行，因为这里只是设置默认值，只是为了不报错
        // 选择名字为game的元素
        this.appContainer = document.querySelector(".game") || document.querySelector(div)
        //分辨率参数变量
        this.resolution = 1;

        // 存放APP各种场景的容器
        // 整个app
        this.app = null;
        // app里面主场景
        this.stage = null;
        // 主场景里面的开始场景
        this.startScene = null;
        //主场景里面的游戏场景
        this.gameScene = null

        //stage里面用于加载图片的loader
        this.loader = null;
        //存放加载好的图片
        this.textures = {}


        // 函数
        //加载中的函数
        this.onProgress = function () { }

        //浅拷贝 将this与options合并(似乎无用)
        Object.assign(this, options)

        // console.log(this)
        return this
    }
    // 主函数
    init () {
        //从我们创建的类中拿到宽度，高度，放入到哪个元素里面，以及显示的分辨率(废弃，现在直接使用this)
        // let {width,height,resolution,element} = this
        // console.error(this.width,width)


        // 1.初始化PIXI

        //1.1 创建主函数APP，放到的this里面
        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            antialias: true, // default: false 反锯齿
            backgroundAlpha: 0.5, //设置背景透明度
            // backgroundColor: 0xffffff, //设置背景颜色
            resolution: this.resolution || 1, // default: 1 分辨率
            // forceCanvas: true, //使用Canvas来渲染
            autoDensity: true // 这属性很关键 模糊的处理
        })

        //将鼠标的样式弄没，相当于Display:none(废弃，原因：我们选择保留)
        this.app.renderer.plugins.interaction.cursorStyles.default = `none`;
        this.app.renderer.plugins.interaction.cursorStyles.hover = `none`;
        this.app.renderer.plugins.interaction.cursorStyles.pointer = `none`;

        //1.2 将创建好的PIXI App放入到我们选择容器中的
        this.appContainer.appendChild(this.app.view);


        // 1.3设置stage 
        // 将app里面的stage 放入到this中
        this.stage = this.app.stage
        //用于设置层级也就是开启使用z-index选项，需要开启（必要）
        this.stage.sortableChildren = true
        // 给stage设置可交互的形式
        this.stage.interactive = true

        // 1.4 创建加载器加载我们需要的资源

        // 创建loader
        this.loader = new PIXI.Loader();

        // 调用子函数loadTextures用于加载我们本地存储的资源
        this.loadTextures().then((res) => {
            // 将加载好的资源都放到texture对象中
            this.textures = res

            // 放置到Texttures 方便我们在其他地方使用，后期可以用Vuex优化
            //Object.keys 获取对象的key
            let texturesKey = Object.keys(res)
            texturesKey.map((item) => {
                let key = item
                let value = res[key]
                // 注意此时我们放进去的是texture
                setTexture(key, value.texture)
            })
            this.render()
        })

        // 1.5 创建游戏开始的场景
        //此时传入的this，会在StartScene中使用，用到的参数是宽度和高度
        this.startScene = new StartScene(this)
        //主场景添加对应的场景
        this.stage.addChild(this.startScene.stage)

        // 创建游戏场景
        this.gameScene = new GameScene(this)
        //主场景添加对应的场景
        this.stage.addChild(this.gameScene.stage)



    }
    //渲染
    render () {


        //绘制鼠标，显示主场景
        this.draw();
        //添加事件主循环，开始画面实时更新
        this.update();
    }
    //销毁整个Canvas 并不在这里调用，而是在页面卸载时调用
    destroy () {
        //主场景.destroy(是否销毁整个游戏，???)
        this.app.destroy(true, true)
    }
    //绘制 作用初始化自定义鼠标和初始化游戏场景
    draw () {
        //绘制鼠标
        this.drawAim();
        //初始化 开始场景
        this.startScene.init()

        //存储事件
        //如果开始事件被调用，隐藏开始的场景，初始化并显示游戏场景
        Bus.$on("startGame", () => {
            this.startScene.hide();
            this.gameScene.init();
            this.gameScene.show();
        })

    }
    //初始化鼠标/绘制鼠标
    drawAim () {
        //创建鼠标的精灵图
        let aim = createAim({
            x: -100,
            y: -100
        })
        //this.stage 其实是this.app.stage 就是游戏的主舞台
        //舞台.on("监听的事件")
        //鼠标移动
        this.stage.on("pointermove", e => {
            // console.log(e)
            // e.data.global 数据示例:global: Point {x: 808, y: 119}

            //xx.position.copyFrom({x,y})  复制 该位置的xy,给copyFrom 使用的对象xx
            aim.position.copyFrom(e.data.global)
        })

        //poiniterdown  鼠标点击
        this.stage.on("pointerdown", e => {
            aim.position.copyFrom(e.data.global)
        })

        //主场景添加鼠标样式啊
        this.stage.addChild(aim)
    }

    //更新主场景
    update () {
        //主场景.ticker = 游戏的主循环
        //delta 相当于当前的帧数 
        this.app.ticker.add((delta) => {
            //如果开始场景存在就调用开始场景的主场景
            this.startScene && this.startScene.update(delta)
            //如果游戏场景存在就调用游戏场景
            //相当于我们的场景就是实时更新的
            this.gameScene && this.gameScene.update(delta)
        })
    }



    //子函数区
    // 子函数loadTextures用于加载我们本地存储的资源
    loadTextures () {
        //此处的assets来自于我们同级文件夹下的assets文件
        console.log(assets, 123)

        // 获取对象名与对象值
        //方法1
        //Object.keys(obj) 获取对象的对象名的数组
        // let keyObj=Object.keys(assets)
        // console.log(keyObj)
        // keyObj.map((item)=>{
        // console.log(item+assets[item])
        // })


        // 返回promise对象，确保我们的加载完毕

        return new Promise((resolve, reject) => {

            // 获取对象名与对象值
            //方法2
            //  Object.entries(obj) 将对象转换成map类型
            let assetsMap = Object.entries(assets)
            assetsMap.forEach(([key, value]) => {
                // 存放资源到我们自己设置的对象

                this.loader.add([{
                    name: key,
                    url: value
                }])
            })
            //加载我们所需要的资源
            this.loader.load((loader, resources) => {
                console.log(resources);
                console.log(loader);
                resolve(resources)
            })
        })


    }



}
