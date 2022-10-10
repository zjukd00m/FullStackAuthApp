import { Route, Routes } from "react-router-dom";
import Home from "./views/Home";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
        </Routes>
    );
}

export default App;
