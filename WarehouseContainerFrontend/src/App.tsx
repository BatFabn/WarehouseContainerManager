import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";

const App: React.FC = () => {
  const [login, setLogin] = useState(false);

  const verified = () => {
    login ? setLogin(false) : setLogin(true);
  };
  return (
    <div>
      {!login && <LoginPage verified={verified} />}
      {login && <Dashboard verified={verified} />}
    </div>
  );
};

export default App;
