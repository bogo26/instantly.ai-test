import "@/styles/globals.css";
import Head from 'next/head';
import Link from 'next/link';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import {AccountBox} from '@mui/icons-material';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Instantly.AI Email App</title>
        <meta name="description" content="Email application with AI capabilities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="sidebar">
          <Link href="/" legacyBehavior>
            <a><EmailIcon /></a>
          </Link>
        </div>
        <main>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </>
  );
}
