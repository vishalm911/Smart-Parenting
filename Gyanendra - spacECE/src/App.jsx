import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import { AppProvider } from './context/AppContext';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/shared/ErrorBoundary';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      <ErrorBoundary fullPage>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
