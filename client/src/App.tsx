import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import useAuth from "./context/auth/AuthHook";
import Home from "./views/Home";
import Profile from "./views/Profile";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";

function App() {
  const { user, getProfile } = useAuth();

  useEffect(() => {
      ;(async () => {
          await getProfile({
              onHTTPSuccess: (data) => {
                  console.log("The user profile in home");
                  console.log(data);
              },
              onHTTPError: (status) => {
                  if (status === 403) {
                      window.location.href = "/signin"
                  }
              },
              onHTTPNetworkError: (e) => {
                  alert(e.message);
              }
          });
      })()
  }, []);

  return (
    <>
      { user.id && <Navbar user={user} /> }
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
