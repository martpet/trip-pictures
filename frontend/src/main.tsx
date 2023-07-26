// todo: remove barrel files to fix code splitting

import '~/assets/index.css';
import '~/features/me/meApi'; // <- load here, prevents cyclic dep. between api <--> meApi

import { SlotProvider } from '@martpet/react-slot';
import ReactDOM from 'react-dom/client';
import { MapProvider } from 'react-map-gl';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { IntlProvider, persistor, store, ThemeProvider } from '~/app';
import { App } from '~/features/app';

const container = document.getElementById('root');

if (!container) {
  throw new Error('React root element is missing');
}

ReactDOM.createRoot(container).render(
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>
      <ThemeProvider>
        <IntlProvider>
          <MapProvider>
            <SlotProvider>
              <App />
            </SlotProvider>
          </MapProvider>
        </IntlProvider>
      </ThemeProvider>
    </PersistGate>
  </ReduxProvider>
);
