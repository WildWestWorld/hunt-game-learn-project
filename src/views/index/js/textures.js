//用于存放与获取加载好的资源
let textures ={}

export function setTexture(key,value){
	textures[key] = value
}
// 获取存放在 textures里面的key
export function getTetxture(key){
	return textures[key]
}