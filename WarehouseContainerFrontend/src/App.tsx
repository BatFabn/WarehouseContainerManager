import React, { useEffect } from "react";
import LoginPage from "./components/LoginPage";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/dashboard");
  });

  return (
    <div>
      <LoginPage />
    </div>
  );
};

export default App;
