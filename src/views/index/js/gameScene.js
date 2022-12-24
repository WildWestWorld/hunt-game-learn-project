import { Container, Graphics, Text } from "pixi.js";

import Scene from "./scene";
import Dog from "./dog";
import Duck from "./duck"

import Bus from "@/utils/bus";

import { playFire, playBgm, playPerfect, playGameWin, playGameOver } from "./audio"
import { createSprite, random, setTopScore, wait } from "@/utils/utils";
import { showToast } from "@/utils/toast";


function checkScore (score) {
    return (Math.min(999999, score) + "").padStart(6, "0")
}


export default class GameScene extends Scene {
    constructor(game) {
        super(game);
        // 初始化 游戏状态
        this.setGameStateDefault();

        // 初始化游戏主场景
        this.setGameStageDefault();
        //放置各种ui显示的容器
        this.setUIContainerDefault();
        // 初始化人物
        //初始化,狗
        this.setDogDefault();

        return this;
    }

    init () {
        //初始化游戏状态
        this.initGameState();
        //初始化游戏主场景
        this.initGameStage();
    }

    // 默认值

    //设置游戏状态默认值
    setGameStateDefault () {
        // 回合数
        this.round = 1;
        // 击中数
        this.hitList = [];
        // 鸭子的数组
        this.duckList = [];
        //子弹数
        this.bulletNum = 3;
        //得分数
        this.score = 0;
        //总数
        this.count = 10;
        //每轮生成的数量
        this.createCount = 2;
        this.totalCount = 0;
        // 最大回合数
        this.maxRound = 3;
        // 击中数
        this.hitCount = 0;
        // 当前回合时间 
        this.timeCount = this.maxTimeCount;
        //最大回合时间
        this.maxTimeCount = 360;
        //是否开始
        this.isStart = false;
        this.isOver = false;
        //是否时间已到
        this.isFlyaway = false;
    }

    // 设置游戏主场景默认值
    setGameStageDefault () {
        // 游戏的容器
        this.stageContainer = new Container();
        //是否可以按照排序
        this.stageContainer.sortableChildren = true;
        // 是否可以交互
        this.stageContainer.interactive = true;
        // 设置游戏场景设置为主舞台的宽度
        this.stageContainer.width = this.game.width;
        // 设置游戏场景设置为主舞台的高度
        this.stageContainer.height = this.game.height;

        //游戏主容器 监听点击事件，如果点击就会触发后面的函数
        this.stageContainer.on("pointerdown", this.handleClick.bind(this))

        // 将场景里面的子容器放入游戏的主场景
        this.stage.addChild(this.stageContainer);
    }
    //开始游戏
    async beginGame () {
        playBgm()
        await this.dog.start();
        await this.nextRound();
    }

    //更新
    update (delta) {
        //如果这个场景都不是显示的就 不用更新
        if (!this.stage.visible) return;
        //拿到分数
        const { score = 0 } = this;
        //设置当前的最高分
        this.scoreTxt && (this.scoreTxt.text = checkScore(score))
        //画出子弹数量
        this.drawDuckUIImg();
        //画出倒计时数量
        this.drawCountDown();
        //画出子弹数量
        this.drawBulletUIImg()

        //调用鸭子的移动方法
        this.duckList && this.duckList.forEach(duck => {
            duck.move(delta)
        })
        //如果没有开始 或者击中的数量 已经大于当前产生的数量 就不执行后面的函数
        if (!this.isStart || this.hitCount >= this.createCount) return;
        //利用系统给的delta 进行倒计时
        this.timeCount = this.timeCount - delta
        //如果倒计时结束
        if (this.timeCount < 0) {
            //暂停游戏
            this.isStart = false;
            //重置时间
            this.timeCount = this.maxTimeCount;
            //更改鸟的状态为isFlyaway
            this.isFlyaway = true;
            //鸟飞走
            this.duckFlyAway();
            //结束这一局
            this.endRound()
        }
    }



    //鸟飞走
    duckFlyAway () {
        this.duckList && this.duckList.forEach(duck => {
            //设置每只鸟的状态为飞走
            duck.isFlyaway = true;
            //变更 x 加速度
            duck.vx = duck.vx * 2.2;
            //变更 y 加速度
            duck.vy = duck.vy * (-12);
        })
    }

    //点击事件 相当于开枪
    async handleClick (e) {
        //如果没有开始，就不执行后续的函数
        if (!this.isStart) return;
        //点击了对应的子弹的数量就会减少
        this.bulletNum = this.bulletNum - 1;
        //播放开火的声音
        playFire()
        //触发在 鸭子类(duck.js)存放的函数
        //鸭子函数会在里面做判断，它里面有一个判别鸭子盒子是否被点击的函数
        //如果鸭子盒子被点击，他的isHit状态就会变更，如果他的isHit状态是true，我们触发sendBullet函数
        //就会让isDeadth 状态变 为true，然后发生一系列动画，然后执行我们这里的函数
        //这里的e我们并没有用到，只用看callback即可,这里callback 里面的duck，其实是我们在鸭子类里面放入的this
        Bus.$emit("sendBullet", {
            e: e.data.global,
            //只有鸭子被击中了这个函数才会被触发
            callback: async duck => {
                //主场景的分数 = 当前分数+被击中鸭子的分数
                this.score = this.score + duck.score;
                //击中鸭子的数量
                this.hitCount = this.hitCount + 1;

                //hitList =用于统计鸭子是否被击中的数组
                //举例:hitList= [false//未击中,true//击中.false,false ...]

                //如果当前这只鸭子的index 对应的值 是true 那么就给他放到后面一位去
                //如果 当前为是false，就给他放到当前位
                if (this.hitList[duck.dIndex]) {
                    this.hitList[duck.dIndex + 1] = true;
                } else {
                    this.hitList[duck.dIndex] = true;
                }

                //如果当前 击中鸭子的数量已经大于等于 当前轮次创建的鸭子数量   而且已经开始了
                //那么就开始下一局
                if (this.hitCount >= this.createCount && this.isStart) {
                    await this.computeRound()
                }
            }
        })
        if (this.bulletNum <= 0 && this.isStart) {
            await this.duckFlyAway();
            await this.computeRound()
        };
    }

    //下一局
    async computeRound () {
        //关闭游戏开始状态
        this.isStart = false;
        //还原时间
        this.timeCount = this.maxTimeCount;
        //暂停0.5s
        await wait(0.5)
        //结束掉这一局
        await this.endRound()
    }
    //结束这一轮
    async endRound () {
        //关闭游戏开始状态
        this.isStart = false;
        //是否为Flyaway 状态
        //如果是的话
        if (this.isFlyaway) {
            //先停止Flyaway状态
            this.isFlyaway = false;
            //执行全部飞走函数
            await this.flyAwayMessage();
        }

        //还原时间
        this.timeCount = this.maxTimeCount;
        //如果击中的数量大于等于2，就显示狗抓住两只鸟
        if (this.hitCount >= 2) {
            await this.dog.caughtDuck(2)
        }
        //如果击中数量等于1，就显示狗抓住一只鸟
        else if (this.hitCount == 1) {
            await this.dog.caughtDuck(1)
        }
        //如果没有任何击中,就显示狗笑了
        else {
            await this.dog.laugh();
        }


        //count 这一轮 生成鸭子的 最大数量
        //totalCount 这一轮 当前生成鸭子的总数量  
        //共计三轮，一轮5局，每局2只鸭子
        if (this.totalCount < this.count) {
            //生成鸭子
            await this.createDuck()
            //开始状态变为开始
            this.isStart = true;
        }
        else {//如果当前生成的鸭子已经和 这一轮的鸭子数量一样了
            //此时就是轮次结算

            //添加当前轮次
            this.round = this.round + 1;

            //筛选 击中List里面 为true值，返回数组，然后获取他的长度，也就是查询你成功打到了几只鸭子
            let hitNum = this.hitList.filter(h => h).length;

            //如果你击中的数量等于当前轮次的最大生成，也就意味着你全部打中了
            if (hitNum === this.count) {
                //显示完美
                await this.onPerfect()
            }
            //设置分数
            setTopScore(this.score)

            //如果当前击中的数量 小于 当前生成数量的60%，那么游戏结束 就没有下一轮了
            if (hitNum / this.count * 100 < 60) {
                return await this.gameOver()
            }

            //如果轮次大于最大轮次，说明你通关了
            //如果没有就要开始下一轮
            if (this.round > this.maxRound) {
                await this.gameWin()
            } else {
                await this.nextRound()
            }
        }
    }

    async nextRound () {
        const { game, stage } = this
        this.hitList = [...Array(this.count).keys()].map(() => false)
        this.bulletNum = 3;
        this.totalCount = 0;
        this.hitCount = 0;
        this.isFlyaway = false
        await showToast({
            game,
            msg: "round\n" + this.round,
            parent: stage,
            duration: 2.5,
            x: game.width / 2,
            y: game.height / 2,
            width: 152,
            height: 70,
        })
        await this.createDuck()
        this.isStart = true
    }

    //显示为完美
    async onPerfect (num = 10000) {
        const { game, stage } = this;
        playPerfect()
        await showToast({
            game,
            msg: "perfect!!\n" + num,
            parent: stage,
            duration: 3,
            x: game.width / 2,
            y: game.height / 2,
            width: 262,
            height: 70,
        })
        // 如果是完美，就给附加分
        this.score = this.score + num;
    }

    //创建鸭子
    async createDuck () {
        //首先清除的鸭子
        this.clearDuck();
        const { createCount, game, totalCount, count } = this;
        // 将子弹的值设置为初始值
        this.bulletNum = 3;

        //生成的总数 = 当前数量 + 生成的数量
        this.totalCount = this.totalCount + createCount;
        for (let i = 0; i < createCount; i++) {
            const duck = new Duck({
                dIndex: totalCount / count * 10,//当前鸭子的索引 = (当前生成鸭子数量/最大生成鸭子数量) *10
                //这里的random是我们自定义的函数
                x: random(80, game.width - 120),//在范围内随机生成鸭子的x值
                y: random(50, game.height - 220),//在范围内随机生成鸭子的y值
                speed: 3 + this.round,//速度，随轮次的增加而变快
                stage: this.stageContainer,//所在的舞台容器
                direction: [-1, 1][~~(Math.random() * 2)]//随机方向
            })
            //放入到鸭子列表中
            this.duckList.push(duck)
        }
    }
    //清除鸭子
    clearDuck () {
        this.drawBackground();//重新绘制背景
        this.isStart = false;//暂停游戏状态
        this.timeCount = this.maxTimeCount;//当前时间 重新设置回默认时间
        this.hitCount = 0;//重置击中的数量
        this.duckList.forEach(duck => {//销毁鸭子列表中的每一只鸭子
            duck && duck.destroy()
        })
        this.duckList.length = 0//清空鸭子列表的长度
    }

    async flyAwayMessage () {
        const { game, stage } = this;
        this.isStart = false;
        this.drawBackground(0xffaaaa)
        await showToast({
            game,
            msg: "fly away",
            parent: stage,
            x: game.width / 2,
            y: game.height / 2,
            duration: 2.5,
            width: 240,
            height: 40,
        })
    }
    //游戏结束
    async gameOver () {
        const { game, stage } = this;
        //播放游戏结束音效
        playGameOver()
        //提示 游戏结束
        await showToast({
            game,
            msg: "game over",
            parent: stage,
            x: game.width / 2,
            y: game.height / 2,
            duration: 4,
            width: 270,
            height: 40,
        })
        //当前 游戏场景 隐藏
        this.hide();
        //开始界面 显示
        game.startScene.show();
    }
    //游戏胜利
    async gameWin () {
        const { game, stage } = this;
        //播放胜利音效
        playGameWin()
        //提示 游戏胜利
        await showToast({
            game,
            msg: "you win!!!",
            parent: stage,
            x: game.width / 2,
            y: game.height / 2,
            duration: 4,
            width: 286,
            height: 40,
        })
        //当前 游戏场景 隐藏
        this.hide();
        //开始界面 显示
        game.startScene.show();
    }


    // 设置各种ui显示的容器默认值
    setUIContainerDefault () {
        this.UIContainer = new Container();
        this.stage.addChild(this.UIContainer);
    }
    // 设置狗默认值
    setDogDefault () {
        // 生成狗，然后把狗放到游戏容器里面，this.stageContainer 会传到dog里面然后会把dog放入到传入的Container里面，详情看Dog
        this.dog = new Dog(this.stageContainer);
        // this.dog.start();
    }


    // 初始化
    //初始化游戏状态
    initGameState () {
        this.duckList = [];
        this.score = 0;
        this.totalCount = 0;
        this.hitList = [...Array(this.count).keys()].map(() => false);
        this.bulletNum = 3;
        this.round = 1;
        this.hitCount = 0;
        this.isStart = false;
        this.isOver = false;
        this.isFlyaway = false;
    }
    //初始化游戏主场景（重要）
    initGameStage () {
        // removeChildren(开始的索引, 结束的索引)
        //清空游戏场景所有元素

        // this.stageContainer.removeChildren(0, this.stageContainer.children.length)

        //初始化最底部的底色背景(天空)
        this.drawBackgroundDeep();
        // 用我们本地图片设置的背景
        this.drawBackground();

        //初始化UI容器
        this.drawUIContainer();

        // 开始游戏
        this.beginGame()

    }
    clearUIContainer () {
        // removeChildren(开始的索引, 结束的索引)
        //清空游戏场景里面的UI容器的所有元素
        this.UIContainer.removeChildren(0, this.stageContainer.children.length);
    }

    // 游戏主场景的背景初始化
    // 设置背景颜色（最底色）
    drawBackgroundDeep (color = 0x3cbcfc) {
        let bgColor = color;
        let backgroundDeep = new Graphics();
        backgroundDeep.beginFill(bgColor, 1);
        backgroundDeep.drawRect(0, 0, this.game.width, this.game.height);
        backgroundDeep.endFill();
        backgroundDeep.zIndex = 0;
        //将背景加入我们的游戏场景
        this.stageContainer.addChild(backgroundDeep);
    }
    //初始化背景
    drawBackground () {
        // createSprite使我们自定义的参数用于拿到我们本地存储的图片
        let background = createSprite({
            name: "stage",
            width: this.game.width,
            height: this.game.height,
            x: 0,
            y: 0,
        });
        background.zIndex = 9;
        this.stageContainer.addChild(background);
    }
    //初始化UI容器
    drawUIContainer () {
        this.drawBulletUIBox();
        this.drawDuckUIBox();
        this.drawScoreUIBox();
    }

    ///UI
    //最左边 子弹容器
    drawBulletUIBox () {
        //创建一个用于存储画的图形的Container
        const box = new Container();
        box.x = 230;
        box.y = 670;

        //画子弹
        this.drawBulletUIBgc(box);
        this.drawBulletUITxt(box);

        this.bulletNumBox = new Container()
        ////绘制图像 子弹
        this.drawBulletUIImg(box);
        box.addChild(this.bulletNumBox);



        this.UIContainer.addChild(box);
    }
    //中间 击中鸭子的容器
    drawDuckUIBox () {
        //创建一个盒子
        const box = new Container();
        box.x = 380;
        box.y = 670;
        //绘制UI的底色
        this.drawDuckUIBgc(box);
        //绘制UI的文字
        this.drawDuckUITxt(box);

        //绘制UI图片
        this.duckNumBox = new Container()
        this.drawDuckUIImg(box);

        box.addChild(this.duckNumBox);


        //画出倒计时
        this.timeCountBox = new Container()
        this.drawCountDown(box);
        box.addChild(this.timeCountBox);


        this.UIContainer.addChild(box);
    }

    //右边 记录得分的容器
    drawScoreUIBox () {
        const box = new Container();
        box.x = 780;
        box.y = 670;
        // 背景
        this.drawScoreUIBgc(box);
        //分数 标题文字
        this.drawScoreUITxt(box)
        //分数 具体数字
        this.drawScoreUINumTxt(box)
        this.UIContainer.addChild(box);
    }

    ///UI子函数
    //bullet子弹
    //画出子弹UI底色
    drawBulletUIBgc (box) {
        ////容器底色
        //创建一个可以绘制的图形
        const graphics = new Graphics();
        //graphics.lineStyle(宽度, 颜色, 透明度);
        //graphics.lineStyle = css中的 border
        graphics.lineStyle(2, 0x66db33, 1);
        //graphics.beginFill(颜色，透明度)
        //graphics.beginFill 图形的填充色
        graphics.beginFill(0x000000, 1);
        //graphics.drawRoundedRect(位置x,位置y,宽度，高度，圆角半径)
        //graphics.drawRoundedRect 绘制图形
        graphics.drawRoundedRect(0, 0, 110, 75, 10);
        //graphics.endFill 完成图形绘制，必须要有
        graphics.endFill();
        //将绘制好的图形放入盒子
        box.addChild(graphics);
    }
    //画出子弹UI的文字
    drawBulletUITxt (box) {
        ////容器的文字

        const shotTxt = new Text("shot".toUpperCase(), {
            fontFamily: "Press Start 2P",
            fontSize: 20,
            leading: 20, //行间距
            fill: 0x3cbcfc,
            align: "left",
            letterSpacing: 1,
        });
        //设置文字的位置
        shotTxt.position.set(15, 45);
        console.log(shotTxt);
        //将文字放到容器内
        box.addChild(shotTxt);
    }
    //画出子弹UI的图片
    drawBulletUIImg (box) {

        if (!this.bulletNumBox) return
        this.bulletNumBox.removeChildren(0, this.bulletNumBox.children.length)

        for (let i = 0; i < this.bulletNum; i++) {
            let bullet = createSprite({
                name: "bullet",
                width: 20,
                height: 20,
                x: 15 + i * 30,
                y: 12,
            });
            this.bulletNumBox.addChild(bullet);
            // box.addChild(this.bulletNumBox);
        }
    }

    //duck鸭子
    //画出鸭子底色
    drawDuckUIBgc (box) {
        const graphics = new Graphics();
        graphics.lineStyle(2, 0x66db33, 1);
        graphics.beginFill(0x000000, 1);
        graphics.drawRoundedRect(0, 0, 360, 75, 10);
        graphics.endFill();
        box.addChild(graphics);
    }
    //画出鸭子的文字
    drawDuckUITxt (box) {
        const txt = new Text("hit".toUpperCase(), {
            fontFamily: "Press Start 2P",
            fontSize: 20,
            leading: 20, //行间距
            fill: 0x3cbcfc,
            align: "left",
            letterSpacing: 1,
        });

        txt.position.set(12, 12);
        box.addChild(txt);
    }
    //画出鸭子的图片
    drawDuckUIImg (box) {
        // const ImgBox = new Container();
        // console.log()
        // console.log(this.count);

        if (!this.duckNumBox) return
        this.duckNumBox.removeChildren(0, this.duckNumBox.children.length)

        for (let i = 0; i < this.count; i++) {
            let bird = createSprite({
                name: this.hitList[i] ? "bird1" : "bird0",
                width: 20,
                height: 20,
                x: 100 + i * 25,
                y: 12,
            });
            this.duckNumBox.addChild(bird);
            // box.addChild(ImgBox);
        }
    }
    //画出 鸭子UI容器中的倒计时
    drawCountDown (box) {
        // const timeContainer = new Container();

        if (!this.timeCountBox) return
        this.timeCountBox.removeChildren(0, this.timeCountBox.children.length)


        for (let i = 0; i < 30; i++) {
            let graphics = new Graphics();
            graphics.beginFill(0x3cbcfc, 1);
            graphics.drawRoundedRect(100 + i * 8.2, 45, 5, 15, 1);
            graphics.endFill();
            this.timeCountBox.addChild(graphics);
        }
        // box.addChild(this.timeCountBox);
    }

    //Score得分

    //绘制Score背景
    drawScoreUIBgc (box) {
        const graphics = new Graphics();
        graphics.lineStyle(2, 0x66db33, 1);
        graphics.beginFill(0x000000, 1);
        graphics.drawRoundedRect(0, 0, 200, 75, 10);
        graphics.endFill();
        box.addChild(graphics);
    }
    //绘制Score文本
    drawScoreUITxt (box) {
        //分数得分的文本
        const scoreTxt = new Text("score".toUpperCase(), {
            fontFamily: "Press Start 2P",
            fontSize: 20,
            leading: 20, //行间距
            fill: 'white',
            align: "left",
            letterSpacing: 1,
        });
        scoreTxt.position.set(52, 42)

        box.addChild(scoreTxt)


    }
    //绘制Score 分数文本
    drawScoreUINumTxt (box) {
        console.log(checkScore(this.score))
        this.scoreTxt = new Text(checkScore(this.score), {
            fontFamily: "Press Start 2P",
            fontSize: 24,
            leading: 20,
            fill: 'white',
            align: 'left',
            letterSpacing: 4,
        })
        this.scoreTxt.position.set(40, 10);

        box.addChild(this.scoreTxt)
    }




}
