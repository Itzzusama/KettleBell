import { NavigationContainer } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import "../i18n";
import Rootnavigator from "./navigation";
import { persistor, store } from "./store";
import { ToastProvider } from "./utils/Toast/toastContext";
import useCustomFonts from "./utils/useCustomFonts";

export default function App() {
  const [fontsLoaded] = useCustomFonts();
  const i18n = useTranslation();
  if (!fontsLoaded) return null;
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <NavigationContainer>
            <Rootnavigator />
          </NavigationContainer>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}

