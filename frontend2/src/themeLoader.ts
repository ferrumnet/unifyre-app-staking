import { loadTheme } from '@fluentui/react';
// const myTheme = {
//     palette: {
//       themePrimary: '#fff53b',
//       themeLighterAlt: '#0a0a02',
//       themeLighter: '#292709',
//       themeLight: '#4d4a12',
//       themeTertiary: '#999323',
//       themeSecondary: '#e0d834',
//       themeDarkAlt: '#fff64e',
//       themeDark: '#fff86a',
//       themeDarker: '#fffa91',
//       neutralLighterAlt: '#0b0b0b',
//       neutralLighter: '#151515',
//       neutralLight: '#252525',
//       neutralQuaternaryAlt: '#2f2f2f',
//       neutralQuaternary: '#373737',
//       neutralTertiaryAlt: '#595959',
//       neutralTertiary: '#4d2d0d',
//       neutralSecondary: '#995a1a',
//       neutralPrimaryAlt: '#e08326',
//       neutralPrimary: '#ff952b',
//       neutralDark: '#ffaf5e',
//       black: '#ffc488',
//       white: '#000000',
//     }}

export const BuilderVariables ={
    palette: {
        themeNavLight: '#0078d4',
        themePrimary: '#0078d4',
        themeLighterAlt: '#eff6fc',
        themeLighter: '#deecf9',
        themeLight: '#c7e0f4',
        themeTertiary: '#71afe5',
        themeSecondary: '#2b88d8',
        themeDarkAlt: '#106ebe',
        themeDark: '#005a9e',
        themeDarker: '#004578',
        neutralLighterAlt: '#f8f8f8',
        neutralLighter: '#f4f4f4',
        neutralLight: '#eaeaea',
        neutralQuaternaryAlt: '#dadada',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c8c8',
        neutralTertiary: '#c2c2c2',
        neutralSecondary: '#858585',
        neutralPrimaryAlt: '#4b4b4b',
        neutralPrimary: '#333333',
        neutralDark: '#272727',
        black: '#1d1d1d',
        white: '#ffffff',
        wierd: '#ffffff',
    },
}
export const WebThemeLoader = () =>
    loadTheme({
    //    ...myTheme,
       ...BuilderVariables,
    });

export function loadThemeForGroup(customTheme: any) {
    console.log('LOADING THEME ', customTheme)
    return loadTheme({
    //    ...BuilderVariables,
    //    ...myTheme,
        palette: {...customTheme}
    });
}