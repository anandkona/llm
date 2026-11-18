
import { useState } from "react";

import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const [currentPage, setCurrentPage] = useState("signup");

  return (
    <div className="app">

      {currentPage === "signup" && (
        <Signup />
      )}

      {currentPage === "forgot" && (
        <ForgotPassword />
      )}

    </div>
  );
}

export default App;
