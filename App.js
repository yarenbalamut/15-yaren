import { store } from "./src/app/store";
import BecomeCustomerScreen from "./src/features/becamoCustomer/BecomeCustomerScreen";

import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <BecomeCustomerScreen />
      </Provider>
    </SafeAreaProvider>
  );
}
