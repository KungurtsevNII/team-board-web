import "./Loading.css"

import blueLogoIcon from "/src/assets/blue_logo.png"
import whiteLogoIcon from "/src/assets/samgtu_logo.png"

interface LoadingProps {
    color?: string
    size?: number
}

export const Loading = ( {color,size}: LoadingProps) => {
    if (!size) {
        size = 100
    }
    var colorPath : string
    switch (color) {
        case "white":
            colorPath = whiteLogoIcon
            break
        default: {
            colorPath = blueLogoIcon
        }

    }
    return(
        <>
            <img 
                className="loading-icon" 
                style={{width: `${size}px`, height: `${size}px`}}
                src={colorPath} 
                alt="Загрузка..." />
        </>
    )
}