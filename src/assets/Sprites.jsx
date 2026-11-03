import hill1 from "./Hero/Hill1.png"
import hill2 from "./Hero/Hill2.png"
import hill3 from "./Hero/Hill3.png"

function Sprite({ src, alt }) {
    return <img
        src={src}
        alt={alt}
        draggable={false}
        style={undefined}
        className="w-full h-full select-none object-contain"
    />
}

export const Hill1 = () => <Sprite src={hill1} alt="Rolling Light Green Hill" />
export const Hill2 = () => <Sprite src={hill2} alt="Rolling Dark Green Hill" />
export const Hill3 = () => <Sprite src={hill3} alt="Rolling Dark Green Hill" />