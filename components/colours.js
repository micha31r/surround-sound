import { GetColorName } from 'hex-color-to-color-name';


export function hsvaToName(hsva) {

    const colorName = GetColorName(hsva); 

    return colorName
}