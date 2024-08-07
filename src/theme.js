import { createTheme } from '@mui/material/styles';

export const themeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#5B4435',
      light: '#a1887f',
      dark: '#4e342e',
    },
    secondary: {
      main: '#656D4A',
      light: '#909a6e',
      dark: '#404a29',
    },
    text: {
      hint: '#8d6e63',
      primary: '#2e2e2e',
      secondary: '#4a4a4a',
      disabled: '#a1887f',
    },
    background: {
      paper: '#f7f6f2',
      default: '#eae7dc',
    },
    error: {
      main: '#a53939',
    },
    warning: {
      main: '#cc8a00',
    },
    info: {
      main: '#467791',
    },
    success: {
      main: '#5a7a5a',
    },
    divider: '#d7ccc8',
  },
};

const theme = createTheme(themeOptions);

export default theme;