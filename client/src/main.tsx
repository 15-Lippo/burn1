import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Web3Provider } from "@/context/web3-context";

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
