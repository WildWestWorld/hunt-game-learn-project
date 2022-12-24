import { playDogStartAudio, playDogLaugh, playCaughtDuck } from "./audio";
import { getTetxture } from "./textures";
import { createSprite } from "@/utils/utils";
import { TimelineMax } from "gsap";

export default class Dog {
    // 我们选择传入的是父级的场景，这样我们创建好狗以后就可以直接把他放到我们想要的场景中
    constructor(stage) {
        this.stage = stage;
        return this;
    }
    // 游戏开始的时候狗的状态 也就是狗状态
    start () {
        return new Promise((resolve, reject) => {
            // 首先创建狗的图片
            let dog = createSprite({
                name: "dog3",
                x: 0,
                y: 570,
            });
            //设置狗图片的优先级
            dog.zIndex = 100;
            //将狗图片放入我们传进来场景
            this.stage.addChild(dog);


            //创建狗的开始时的状态
            //开始的状态有两种 首先是搜寻状态+移动状态，然后是跳出消失状态

            //dogSearchAni(用于狗的变化) 与 dogSearchMoveAni(用于移动)  两个动画合在一起才是一个完整的动画

            //1.1搜寻状态
            //使用gsap创建动画
            let dogSearchAni = new TimelineMax();
            // TimeLineMax.from(对象，时间，{动画的属性})

            // 这里很明显，就只是图片的变化，所以我们还需要创建一个移动的动画

            // gsap.js的SteppedEase缓动模拟帧，这样的好处是每一帧都可以有方法去调节图片的位置去弥补图片大小不一产生的位移问题
            //ease: "SteppedEase(1)"   重要！ 不加就无法变成动画
            dogSearchAni.from(dog, 0.16, {
                texture: getTetxture("dog0"),
                ease: "SteppedEase(1)",
            });
            dogSearchAni.to(dog, 0.16, {
                texture: getTetxture("dog1"),
                ease: "SteppedEase(1)",
            });
            dogSearchAni.to(dog, 0.16, {
                texture: getTetxture("dog2"),
                ease: "SteppedEase(1)",
            });
            dogSearchAni.to(dog, 0.16, {
                texture: getTetxture("dog3"),
                ease: "SteppedEase(1)",
            });
            dogSearchAni.to(dog, 0.2, {
                texture: getTetxture("dog4"),
                ease: "SteppedEase(1)",
            });
            dogSearchAni.repeat(-1);
            // 播放动画
            dogSearchAni.play();

            //1.2移动状态
            let dogSearchMoveAni = new TimelineMax();

            dogSearchMoveAni.fromTo(
                dog, //作用的对象
                {
                    x: 240,
                }, //开始时的状态
                {
                    x: 440,
                    duration: 2.5,
                    ease: "Power0.easeInOut", //结束的状态
                    //完成移动动画后执行的函数
                    onComplete: () => {
                        //结束掉之前狗搜寻的动画
                        dogSearchAni.kill();

                        // 2.创建狗的跳出消失状态
                        let dogJumpDisappearAni = new TimelineMax();
                        // TimeLineMax.from(对象，时间，{动画的属性})
                        // 该状态就是跳跃而起
                        dogJumpDisappearAni.from(dog, 0.8, {
                            texture: getTetxture("dog5"),
                            x: 440,
                            y: 570,
                            ease: "SteppedEase(1)",
                        });
                        // 然后慢慢下坠，所以y的值是慢慢下降的
                        // 注意此时还改变了图片的宽度和高度
                        dogJumpDisappearAni.to(dog, 0.2, {
                            texture: getTetxture("dog6"),
                            x: 460,
                            y: 430,
                            width: getTetxture("dog6").width,
                            height: getTetxture("dog6").height,
                            ease: "SteppedEase(1)",
                        });
                        dogJumpDisappearAni.to(dog, 0.2, {
                            texture: getTetxture("dog7"),
                            x: 480,
                            y: 440,
                            width: getTetxture("dog7").width,
                            height: getTetxture("dog7").height,
                            ease: "SteppedEase(1)",
                        });
                        // 消失
                        dogJumpDisappearAni.to(dog, 0.5, {
                            x: 530,
                            y: 480,
                            alpha: 0,
                            // 当狗消失动画结束
                            onComplete: () => {
                                // 结束移动动画
                                dogSearchMoveAni.kill();
                                // 结束跳跃消失动画
                                dogJumpDisappearAni.kill();

                                // 播放游戏开始音乐(需加上)
                                playDogStartAudio();
                                // 完成promise
                                resolve();
                            },
                        });
                    },
                }
            );
            //播放动画
            // dogSearchMoveAni.play()
        });
    }

    //击中鸭子后狗捉住鸭子
    //这类动画必须return 的是一个Promise 原因是我们需要的是执行完对应的动画后我们才移除掉对应的远古三
    caughtDuck (num = 1) {
        return new Promise((resolve, reject) => {
            // 播放狗捉住鸭子的音效
            playCaughtDuck();
            //创建狗捉住鸭子的图片 dog10 就是一只，dog11就是两只
            let dog = createSprite({
                name: num == 1 ? "dog10" : "dog11",
                x: 560,
                y: 485,
                scale: 1.2,
            });
            //父级场景中加入 捉住鸭子的狗
            this.stage.addChild(dog);
            //创建狗展示鸭子的动画
            let dogShowAni = new TimelineMax();
            //y是从大到到小的，因为y的起始点在顶部。y越大，越往下
            dogShowAni
                //狗在底部
                .from(dog, { y: 570 })
                //狗出现了
                .to(dog, { y: 485, duration: 0.5 })
                //狗 停顿 0.5s 回到底部
                .to(dog, {
                    delay: 0.5,
                    y: 570,
                    onComplete: () => {
                        //动画完成后清除动画
                        dogShowAni.kill();
                        //父场景中移除捉住鸭子的狗
                        this.stage.removeChild(dog);
                        resolve();
                    },
                });
            //播放展示动画
            dogShowAni.play();
        });
    }
    //没击中鸭子，狗笑的状态
    laugh () {
        return new Promise((resolve, reject) => {
            //创建狗的笑的图
            let dog = createSprite({
                name: "dog8",
                x: 560,
                y: 485,
                scale: 1.2
            })
            //父场景中加入 狗笑图片
            this.stage.addChild(dog)
            //播放狗笑的音效
            playDogLaugh();

            //狗笑动画+狗出现动画 合起来才是一个完整的动画

            //创建狗笑的动画
            let laughAni = new TimelineMax();
            //dog8 是狗笑的第一帧，dog9是狗笑的第二帧，无线循环播放，一直到狗的展示动画结束
            laughAni.fromTo(dog, 0.22, { texture: getTetxture("dog8") }, {
                texture: getTetxture("dog9"),
                immediateRender: true,
                ease: "SteppedEase(1)"
            });
            laughAni.repeat(-1)
            laughAni.play()

            //狗出现

            let dogShowAni = new TimelineMax()
            dogShowAni
                .from(dog, { y: 570 })
                .to(dog, { y: 485, duration: .5, })
                .to(dog, {
                    delay: 0.5, y: 570, onComplete: () => {
                        //狗出现 动画完毕后清除掉笑的动画，清除掉狗动画，在父场景中清除 狗笑的动画
                        laughAni.kill();
                        dogShowAni.kill();
                        this.stage.removeChild(dog)
                        resolve()
                    }
                })

            //播放狗出现的动画 
            dogShowAni.play()
        })

    }

}
