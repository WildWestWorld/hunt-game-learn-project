// 开始场景 继承自场景 
//为什么要要继承？因为我们有多个场景，场景各有不同，但是他们存在一些共性，所以我们定义先去定义一个场景类

import {
    Graphics,
    Text
} from "pixi.js";
import {
    TimelineMax
} from "gsap"

import { getTopScore } from '@/utils/utils.js'

import Bus from "@/utils/bus";

import Scene from "./scene";

export default class StartScene extends Scene {
    constructor(game) {
        //game = 外部的this,这里的传进来的参数的位置在index里面
        //这里的game，在外部我们传进来的就是this变量，也就是外部所有的内容
        super(game)
        //最高分数显示的容器
        this.topScore = null;

        return this;
    }
    // 初始化
    init () {


        //// 绘制场景
        //绘制背景
        this.drawBg()
        //绘制标题
        this.drawTitle()
        //绘制开始游戏的文字
        this.drawStartText()
        //绘制底部的最高分数
        this.drawTopScore()
    }
    // 更新
    update () {
        //如果场景是不可见的就return 
        if (!this.stage.visible) {
            return
        }
        //如果有最高分数的文本文字存在了，再去获取对应的最高分数文字
        if (this.topScore) {
            //就去获取下当前的最高分数
            let topScoreSave = getTopScore()
            //设置最高分数的文本文字
            this.topScore.text = `TOP SCORE = ${topScoreSave}`
        }
    }

    //绘制背景，就是开始背景的那个黑框
    drawBg () {
        //绘制黑框
        const graphics = new Graphics();
        //绘制形状的颜色以及透明度， graphics.beginFill(颜色,透明度)
        graphics.beginFill(0x000000, 1)
        //绘制形状的位置以及宽高  rectangle.drawRect(位置x, 位置y, 宽度width, 高度height);
        graphics.drawRect(0, 0, this.game.width / 1, this.game.height / 1)
        console.error(this.game, 'game')
        //完成绘制
        graphics.endFill();
        //将绘制好的图形放入到startScene
        this.stage.addChild(graphics)
    }
    // 绘制进入游戏时的标题
    drawTitle () {
        // 我们有两个标题，他们不是在一起所以有两个

        // 标题1，Duck
        //Text('内容',{内容的样式})
        //值得一提的是Text的内容，若是要变成大写的就得是先写成小写然后用
        //转大小写的原因不知为何，可能有BUG吧，
        const titleTop = new Text("duck".toUpperCase(), {
            fontFamily: 'Press Start 2P',
            fontSize: 148,
            // 行距
            leading: 20,
            // 字体的颜色
            fill: 0x1596EE,
            // 对齐方式
            align: 'left',
            // 字间距
            letterSpacing: 4
        })
        // 设置上标题所在的位置
        titleTop.position.set(120, 80)
        // 将上标题放入我们的StartScene中
        this.stage.addChild(titleTop)


        // 两个标题中间的横线
        const lineGraphics = new Graphics()
        lineGraphics.beginFill(0xFF5900, 1);
        lineGraphics.drawRect(this.game.width * 0.1, 260, this.game.width * 0.8, 5)
        lineGraphics.endFill();

        // 将创建出的横线放入我们的StartScene中
        this.stage.addChild(lineGraphics)

        //下边的标题
        const titleBottom = new Text("hunt".toUpperCase(), {
            fontFamily: 'Press Start 2P',
            fontSize: 148,
            leading: 20,
            fill: 0x1596EE,
            align: 'left',
            letterSpacing: 4
        })
        // 设置上标题所在的位置
        titleBottom.position.set(490, 300)
        // 将下标题放入我们的StartScene中
        this.stage.addChild(titleBottom)

    }
    //绘制开始游戏的文字
    drawStartText () {
        const startText = new Text("Click to start the game".toUpperCase(), {
            fontFamily: "Press Start 2P",
            fontSize: 24,
            leading: 10,
            fill: 0xFF5900,
            align: 'left',
            letterSpacing: 2
        })
        // 设置中心点
        startText.anchor.set(0.5, 0.5)
        // 设置开始文本的文字
        startText.position.set(this.game.width / 2, 560)

        // 可以交互
        startText.interactive = true;
        // 按照按钮来渲染
        startText.buttonMode = true;

        //当我们的鼠标点击时 当被触发时就执行startGame ,这里的startGame事件存储点在Index文件
        // this.stage.on("事件",事件触发时的函数) 这个on事件是PIXI自带的
        this.stage.on("pointerdown", e => {
            Bus.$emit("startGame")
        })

        // 给startText添加动画
        //这是个闪烁动画
        // TimelineMax().fromTo(元素，{开始的状态},{结束的状态})
        //immediateRender 立即渲染
        //ease 运动的方式  一般我们直接用SteppedEase(1)就行了
        let blinkAni = new TimelineMax().fromTo(startText, { alpha: 0 }, { alpha: 1, duration: 0.45,immediateRender:true,ease:"SteppedEase(1)" })

        //    repeat(循环的次数)  -1意味着无限循环
        blinkAni.repeat(-1)
        //如果yoyo(true)，那么动画的循环就是倒序，需要配合repeat属性
        blinkAni.yoyo(true);

        // 将我们的开始文本加入场景
        this.stage.addChild(startText)

    }

    //绘制最高得分文字
    drawTopScore (score = 0) {
        this.topScore = new Text("top score = ".toUpperCase() +score, {
            fontFamily: 'Press Start 2P',
            fontSize: 24,
            leading: 20,
            fill: 0x66DB33,
            align: 'center',
            letterSpacing: 4
        })
        // 设置锚点
        this.topScore.anchor.set(0.5, 0.5)
        //设置最高得分的位置
        this.topScore.position.set(this.game.width / 2, this.game.height - 60)
        //将最高得分放入到场景中
        this.stage.addChild(this.topScore)
    }

}
