import { createSprite, wait } from "@/utils/utils";
import { Container, getTestContext, Graphics, Text } from "pixi.js";
import { DuckSound } from "./audio";
import { getTetxture } from "./textures";

import Bus from "@/utils/bus"; //引入eventBus.js文件
import { showScore } from "@/utils/toast";
import { TimelineMax } from "gsap";

export default class Duck {
    constructor({
        stage,//父容器
        dIndex = 0,//鸭子的初索引
        x = 0,//鸭子初位置x
        y = 0,//鸭子初位置y
        speed = 3,//初始速度
        direction = 1,//鸭子方向
        rect = [0, 0, 1200, 759],//初始的鸭子活动范围
    }) {
        //stage 从父级传入 方便我们把他放到需要的场景中
        this.stage = stage;
        // dIndex 相当于是我们产出的第几只鸭子
        this.dIndex = dIndex;
        //vx 相当于 x 轴的加速度
        this.vx = speed * direction;
        //vy 相当于 y 轴的加速度
        this.vy = speed;
        //对应鸭子的活动范围
        this.rect = rect;
        //击中一只鸭子的得分
        this.score = 500;
        //是否击中鸭子
        this.isHit = false;
        //鸭子是否死亡
        this.isDie = false;

        // 是否全部都飞走
        this.isFlyaway = false;

        //初始化鸭子图片
        this.sprite = createSprite({
            name: "duck_0",
        });
        // 鸭子图片的x轴缩放大小
        this.sprite.scale.x = this.sprite.scale.x * direction;
        //初始化鸭子声音 这个是我们自定义的类 有兴趣可以自己去看下
        this.duck_sound = new DuckSound();

        //鸭子的实体容器(相当于击中的范围容器)
        this.targetDuckContainer = new Container();
        //最一开始鸭子的位置 x
        this.targetDuckContainer.x = x;
        //最一开始鸭子的位置 y
        this.targetDuckContainer.y = y;

        //设置为按钮模式
        this.targetDuckContainer.buttonMode = true;
        // 设置为可交互
        this.targetDuckContainer.interactive = true;
        //PIXI元素.on("事件",事件回调)
        //如果鸭子容器 被点到了，也就是意味着 鸭子要变成死鸭子了
        //与下面的sendBullet 和到一起就是完整的鸭死亡过程
        //鸭被点到 ,被击中状态变化 =>是否死亡状态变化=> 进行击中结算
        this.targetDuckContainer.on("pointerdown", () => {
            if (!this.isHit) {
                this.isHit = true;
            }
        });
        //将鸭子图片放入到容器
        this.targetDuckContainer.addChild(this.sprite);
        //鸭子容器放入到场景中
        this.stage.addChild(this.targetDuckContainer);

        //普通的鸭动画
        this.normalAni = new TimelineMax();
        //鸭的死亡动画
        this.dieAni = new TimelineMax();

        //初始化鸟的飞行动画
        this.initFlyAni();

        //监听BUS，接收事件On，也就是On里面的事件被触发时 会执行里面的代码
        //发送子弹

        Bus.$on("sendBullet", ({ e, callback }) => {
            //如果鸟还没死，但是被击中 那么就设置鸟的状态为死
            if (this.isHit && !this.isDie) {
                this.isDie = true;
                //被击中
                this.hit();
                //播放鸟被击中的声音
                this.duck_sound.play();
                //执行回调，这里回调给的this,就是鸭里面的所有内容
                callback && callback(this);
            }
        });

        return this;
    }

    //初始化飞行动画
    initFlyAni () {
        const { sprite } = this;
        this.normalAni.from(sprite, 0.1, {
            texture: getTetxture("duck_0"),
            width: getTetxture("duck_0").width,
            height: getTetxture("duck_0").height,
            ease: "SteppedEase(1)",
        });
        this.normalAni.to(sprite, 0.1, {
            texture: getTetxture("duck_1"),
            width: getTetxture("duck_1").width,
            height: getTetxture("duck_1").height,
            ease: "SteppedEase(1)",
        });
        this.normalAni.to(sprite, 0.1, {
            texture: getTetxture("duck_2"),
            width: getTetxture("duck_2").width,
            height: getTetxture("duck_2").height,
            y: -15,
            ease: "SteppedEase(1)",
        });
        //动画无限循环并播放
        this.normalAni.repeat(-1);
        this.normalAni.play();
    }

    //被击中
    async hit () {
        const { sprite, score, targetDuckContainer } = this;
        //清除常规飞行动画
        this.normalAni.kill();
        //变更当前的物体的图片
        sprite.texture = getTetxture("duck_9");
        sprite.width = getTetxture("duck_9").width;
        sprite.height = getTetxture("duck_9").height;

        //显示击中分数
        showScore({
            parent: this.stage,
            score,//score 是单个鸭子的得分，就在上面
            //显示的位置
            //如果他的朝向是负的，鸭盒子的当前位置x就要鸭子的当前x,意义不明，后期调查
            x: targetDuckContainer.x - (this.vx < 0 ? +sprite.width : 0),
            y: targetDuckContainer.y,
        });
        //等待
        await wait(0.35);
        //让鸭子死亡
        this.die();
    }
    // 死亡
    die () {
        //播放被击落的音效
        this.duck_sound.playDown();
        const { sprite } = this;
        //变更图片
        sprite.texture = getTetxture("duck_10");
        sprite.width = getTetxture("duck_10").width;
        sprite.height = getTetxture("duck_10").height;
        //死亡动画
        this.dieAni.to(sprite, 0.6, {
            //下落到屏幕外，然后销毁
            y: 600,
            onComplete: () => {
                //调用销毁就在下面，感兴趣自己看
                this.destroy();
                // 暂停鸭叫
                this.duck_sound.pauseDown();
            },
        });
    }
    //销毁 鸭子容器 鸭子死亡时会用到
    destroy () {
        if (this.targetDuckContainer.parent) {
            this.targetDuckContainer.parent.removeChild(this.targetDuckContainer);
        }
    }

    //移动 这个移动的函数是在父级被调用的，具体说是父级的Update函数
    move (delta) {
        //如果鸭子已经死了，或者被击中就不用调用了
        if (this.isHit || this.isDie) return;

        //获取到我们自定义的返回的参数
        //x :活动范围 盒子位置x
        //y:活动范围 盒子 位置y
        //w:活动范围 盒子的宽度
        //h:活动范围 盒子的高度
        const [X, Y, W, H] = this.rect;

        //鸭子盒子的位置x   = 鸭子盒子的x + x轴加速度
        //营造出移动的感觉
        this.targetDuckContainer.x = this.targetDuckContainer.x + this.vx;
        this.targetDuckContainer.y = this.targetDuckContainer.y + this.vy;

        //如果是状态是Flyaway的状态，也不用再执行了
        if (this.isFlyaway) return;

        //如果鸭子盒子的x 小于 最小活动范围的x，也就是太往左，已经要超出左边界
        //或者 (鸭子盒子的x+this.sprite.width / 2)=鸭子的中心点x ，太往右超出了，右边界时
        //就该改变当前鸭子的加速度，也就取个反，让他在反方向移动，缩放的比例也取反(?，不知这个干啥的，待考察)
        if (
            this.targetDuckContainer.x < X ||
            this.targetDuckContainer.x > W - this.sprite.width / 2
        ) {
            this.vx = this.vx * (-1);
            this.sprite.scale.x = this.sprite.scale.x * (-1);
        }

        //y越小，越往上
        //如果鸭子盒子的y 小于 最小活动范围的y，也就是太往上，已经要超出上边界
        //或者 (鸭子盒子的y+this.sprite.width / 2)=鸭子的中心点y 大于最大活动范围h ，太往下超出了，下边界时
        
        //为什么要减去180 ，因为 这个H其实是我们的游戏大小 ，而180 就是草丛的高度

        //就该改变当前鸭子的加速度，也就取个反，让他在反方向移动
        if (
            this.targetDuckContainer.y < Y + this.sprite.height / 2 ||
            this.targetDuckContainer.y > H - 180 - this.sprite.height / 2
        ) {
            this.vy = this.vy * (-1);
        }
        // this.duckDelta += delta;
        // if(this.duckDelta>this.soundDuration){
        //     this.duckDelta = 0;
        //     this.soundDuration = random(50,150)
        //     this.duck_sound.play()
        // }
    }
}
