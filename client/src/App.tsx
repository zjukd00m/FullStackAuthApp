import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import useAuth from "./context/auth/AuthHook";
import Home from "./views/Home";
import Profile from "./views/Profile";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import "react-toastify/dist/ReactToastify.css";
import UsersTable from "./components/UsersTable";
import ProfileSettings from "./views/Profile/Settings";
import ProfileSecurity from "./views/Profile/Security";
import NotFound from "./views/NotFound";
import Shield from "./components/Shield";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) window.location.href = "/signin"
  }, []);

  return (
    <>
      <ToastContainer 
        position="bottom-right" 
        closeOnClick
        hideProgressBar
        draggable={false}
        theme="light"
      />
      <Routes>
        {/* Protected routes */}
        <Route element={<Shield />}>
          <Route path="/" element={<Home />}>
            <Route index element={<UsersTable />} />
            <Route path="profile" element={<Profile />}>
              <Route index element={<ProfileSettings />} />
              <Route path="security" element={<ProfileSecurity />} />
            </Route>
          </Route>
        </Route>
        {/* Public routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        {/* Missing route */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </>
  );
}

export default App;
