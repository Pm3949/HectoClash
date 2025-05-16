import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { ToastContainer, toast, Bounce, Flip } from "react-toastify";
import store from "./redux/store.js";
import "react-toastify/dist/ReactToastify.css";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { SocketProvider } from "./context/soxketContext.js";

let persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SocketProvider>
            <App />
          </SocketProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Flip} // Now correctly imported
          />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
