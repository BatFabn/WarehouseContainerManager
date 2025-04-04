import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RackPage from "./components/RackPage";
import Dashboard from "./components/Dashboard";
import MemberManagement from "./components/Members";

const router = createBrowserRouter([
  {
    children: [
      { path: "/", element: <App /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/members", element: <MemberManagement /> },
      {
        path: "/rack/:containerId/:rackId",
        element: <RackPage />,
      },
    ],
  },
]);

export default router;
