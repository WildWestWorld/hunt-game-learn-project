// 引入我们存放在utils中的方法
import {
	getPulicUrl
} from '@/utils/utils.js'


//该文件用于获取各类静态资源存放的地址


//音乐文件
const audioList = {
	// fire: `${baseUrl}/src/assets/fire.mp3`,
	fire: getPulicUrl("fire", "mp3"),
	caught_duck: getPulicUrl("caught_duck", "mp3"),
	bgm: getPulicUrl("bgm", "mp3"),
	dog_start: getPulicUrl("dog_start", "mp3"),
	dog_laugh: getPulicUrl("dog_laugh", "mp3"),
	perfect: getPulicUrl("perfect", "mp3"),
	game_over: getPulicUrl("game_over", "mp3"),
	game_win: getPulicUrl("game_win", "mp3"),
	duck_sound: getPulicUrl("duck_sound", "mp3"),
	duck_down: getPulicUrl("duck_down", "mp3"),
}
// 状态栏图片
const bird0 = getPulicUrl("bird0");
const bird1 = getPulicUrl("bird1");
const bullet = getPulicUrl("bullet");
const aim = getPulicUrl("aim");
const stage = getPulicUrl("stage");

//狗的不同状态
//虽然我们现在创建出来是对象，但是我们传出去的时候是用...符号解构掉的
const dogList = {}
for (let i = 0; i < 12; i++) {
    dogList["dog" + i] = getPulicUrl("dog" + i)
}


//飞在天上的鸭子的不同状态
//虽然我们现在创建出来是对象，但是我们传出去的时候是用...符号解构掉的
const duckList = {}
for (let i = 0; i < 11; i++) {
    duckList["duck_" + i] = getPulicUrl("duck_" + i)
}


// 将文件暴露出去 因为是default 之后引入的时候写什么名字都可以，反正内容是下面放进去的
export default {
	    stage,
	    aim,
	    bird0,
	    bird1,
	    bullet,
	    ...audioList,
	    ...dogList,
	    ...duckList
}
