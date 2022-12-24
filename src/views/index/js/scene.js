import {
    Container
} from "pixi.js";

export default class Scene {
    constructor(game) {
        //这里的game，在外部我们传进来的就是this变量，也就是外部所有的内容
        this.game = game;
        //设置该场景为Container
        this.stage = new Container();
        ////配置场景的参数
        //设置场景可交互
        this.stage.interactive = true;
        //设置是否作为一个按钮渲染
        this.stage.buttonMode = true
        //是否按照 z-index排序
        this.stage.sortableChildren = true
        //设置默认的z-index值
        this.stage.zIndex = 1
        return this
    }
    //设置场景是否展现
    // 场景展现
    show () {
        this.stage.visible = true
    }
    hide () {
        this.stage.visible = false
    }
    update (delta) {
        // 如果场景是不可见的就return
        if (!this.stage.visible) {
            return
        }
    }
}
