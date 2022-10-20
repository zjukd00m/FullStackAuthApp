import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import useAuth from "./context/auth/AuthHook";
import Home from "./views/Home";
import Profile from "./views/Profile";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) window.location.href = "/signin"
  }, []);

  return (
    <>
      <Navbar />
      <ToastContainer 
        position="bottom-left" 
        closeOnClick
        hideProgressBar
        draggable={false}
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

export default App;
