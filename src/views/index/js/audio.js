// 引入资源文件，那里放着是我们资源存放的位置
import assets from './assets'

//初始化音频文件
let fireVoice = new Audio(assets["fire"])
let bgmVoice = new Audio(assets["bgm"])
let dogStart = new Audio(assets["dog_start"])
let dogLaugh = new Audio(assets["dog_laugh"])
let caught_duck = new Audio(assets["caught_duck"])
let perfect = new Audio(assets["perfect"])
let game_win = new Audio(assets["game_win"])
let game_over = new Audio(assets["game_over"])




export function playGameWin () {
    game_win.volume = 1
    game_win.play()
}

export function playGameOver () {
    game_over.volume = 1
    game_over.play()
}

//完美
export function playPerfect () {
    perfect.volume = 1
    perfect.currentTime = 0
    perfect.play()
}
//开枪的声音
export function playFire () {
    fireVoice.volume = 1
    fireVoice.currentTime = 0
    fireVoice.play()
    return fireVoice
}



//狗捉住到鸭子的声音
export function playCaughtDuck () {
    caught_duck.volume = 1
    caught_duck.currentTime = 0
    caught_duck.play()
}

//狗游戏开始时的声音
export function playDogStartAudio () {
    // 设置音量
    dogStart.volume = 1
    //设置开始时间
    dogStart.currentTime = 0
    //播放音乐
    dogStart.play()
}
//没抓住鸭子 狗笑的声音
export function playDogLaugh () {
    dogLaugh.volume = 1
    dogLaugh.currentTime = 0
    dogLaugh.play()
}
//停止狗笑
export function pauseDogLaugh () {
    dogLaugh.pause();
}


export function playBgm () {
    bgmVoice.volume = 1
    bgmVoice.play()
}




export class DuckSound {
    constructor() {
        this.audio = new Audio(assets["duck_sound"])
        this.down = new Audio(assets["duck_down"])
        this.down.playbackRate = 2.5
    }
    playDown () {
        this.down.play()
    }
    pauseDown () {
        this.down.pause()
    }
    play () {
        this.audio.play()
    }
    pause () {
        this.audio.pause()
    }
}


