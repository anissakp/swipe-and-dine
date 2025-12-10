// source: React library - https://react.dev/
// source: ReactDOM for rendering - https://react.dev/reference/react-dom/client
// source: Material UI theming - https://mui.com/material-ui/customization/theming/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// create custom MUI theme with apple-style system font stack
const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont', 
      '"SF Pro Display"', 
      '"SF Pro Text"', 
      '"Helvetica Neue"',  
      'Arial',                   
      'sans-serif',           
    ].join(','),
  },
});

// get the root DOM element from index.html
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// render the app with strict mode and theme provider
// StrictMode: enables additional development checks and warnings
// ThemeProvider: provides MUI theme context to all child components
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);