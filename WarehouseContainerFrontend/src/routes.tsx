import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RackPage from "./components/RackPage";
import Dashboard from "./components/Dashboard";

const router = createBrowserRouter([
  {
    children: [
      { path: "/", element: <App /> },
      { path: "/dashboard", element: <Dashboard verified={() => {}} /> },
      { path: "/rack", element: <RackPage verified={() => {}} /> },
    ],
  },
]);

export default router;
