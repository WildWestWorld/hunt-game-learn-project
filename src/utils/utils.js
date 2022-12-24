
import { getTetxture } from "@/views/index/js/textures"
import { Sprite } from "pixi.js"

// getAssetUrl 动态获取我们的存放在本地的静态资源（废弃，原因：import.meta.url返回的是文件夹路径而并非服务器地址）
// export function getAssetsUrl(name, ext = "png") {
// 	console.log(import.meta.url)
// 	return new URL(`/src/asset/${name}.${ext}`,import.meta.url).href
// }


//服务器地址(根据自己的电脑自己变更) (废弃，我们改用动态引入静态文件的方式，详情在utils/utils/getAssetUrl方法汇总)
const baseUrl = 'http://localhost:8080'

// getAssetUrl 动态获取我们的存放在本地assets的静态资源V2

export function getAssetsUrl (name, ext = "png") {
    // console.log(import.meta.url)
    return new URL(`${baseUrl}/src/assets/${name}.${ext}`).href
}

// getAssetUrl 动态获取我们的存放在本地pulic的静态资源
export function getPulicUrl (name, ext = "png") {
    let url = `img/${name}.${ext}`
    return url
}


// 获取存储的最高分数
export function getTopScore () {
    return window.localStorage.getItem("topScore") || 0
}
export function setTopScore (score = 0) {
    let top_score = Math.max(score, getTopScore());
    window.localStorage.setItem("topScore", top_score)
}


// 便于我们创建资源文件对应的精灵图(重要)
export function createSprite ({ name, x = 0, y = 0, scale = 1, width, height, zIndex = 0, anchor = 0 }) {
    let texture = getTetxture(name);
    // console.log(texture)

    let sprite = new Sprite(texture);
    sprite.x = x;
    sprite.y = y;

    sprite.width = (width || texture.width) * scale;
    sprite.height = (height || texture.height) * scale;
    sprite.zIndex = zIndex;
    sprite.anchor.set(anchor)
    return sprite;
}

//延迟

export function wait (t = 1) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, t * 1000)
    })
}
//设置随机数 在一个范围内设置随机数
export function random (lower, upper) {
    lower = +lower || 0   //这里的加 意味着他是个数字
    upper = +upper || 0    //这里的加 意味着他是个数字
    return Math.random() * (upper - lower) + lower;
}