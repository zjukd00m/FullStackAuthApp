import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./views/Home";
import Profile from "./views/Profile";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import "react-toastify/dist/ReactToastify.css";
import ProfileSettings from "./views/Profile/Settings";
import ProfileSecurity from "./views/Profile/Security";
import NotFound from "./views/NotFound";
import Shield from "./components/Shield";
import AdminHome from "./views/Home/AdminHome";
import UserHome from "./views/Home/UserHome";

function App() {
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
        {/* Protected routes for admin */}
        <Route 
          path="/" 
          element={
            <Shield allowedRoles={["ADMIN"]} />
          }
        >
          <Route path="admin" element={<Home />}>
            <Route index element={<AdminHome />} />
            <Route path="profile" element={<Profile />}>
              <Route index element={<ProfileSettings />} />
              <Route path="security" element={<ProfileSecurity />} />
            </Route>
          </Route>
        </Route>

        {/* Protected routes for others */}
        <Route element={<Shield allowedRoles={["OTHER"]} />}>
          <Route path="" element={<Home />}>
            <Route index element={<UserHome />} />
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
