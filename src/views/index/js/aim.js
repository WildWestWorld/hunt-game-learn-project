import { createSprite } from "@/utils/utils";

//用于绘制鼠标
export function createAim({
    x,
    y,
    // handleClick
}) {
    let aim = createSprite({
        name: "aim",
        x,
        y,
        height: 36,
        width: 36,
        anchor: 0.5
    })
    aim.zIndex = 100000;
    return aim
}