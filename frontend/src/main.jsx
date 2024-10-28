import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import configureStore from "./store/store.js";
import { Provider } from "react-redux";
import { restoreCSRF, csrfFetch } from "./store/csrf.js";
import * as sessionActions from './store/session';
import './index.css';

const store = configureStore();

if (import.meta.env.MODE !== "production") {
  restoreCSRF();

  window.store = store;
  window.csrfFetch = csrfFetch;
  window.sessionActions = sessionActions;

}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <Provider store={store}>

        <App />

      </Provider>
  </React.StrictMode>
);
