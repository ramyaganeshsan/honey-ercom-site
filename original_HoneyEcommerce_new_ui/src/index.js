import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Provider } from "react-redux";
import store from "./rtk/store";
import { BrowserRouter as Router } from "react-router-dom";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sanitizeAuthStorage } from "./utils";

// Drop stale encrypted auth (wrong secret / corrupt) before any query runs
sanitizeAuthStorage();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <Router>
        <App />
      </Router>
      <ToastContainer newestOnTop pauseOnHover transition={Slide} />
    </React.StrictMode>
  </Provider>
);

reportWebVitals();
