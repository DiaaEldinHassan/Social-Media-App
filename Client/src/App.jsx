import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import Home from "./pages/Home/Home";
import OTP from "./pages/OTP/OTP";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Chat from "./pages/Chat/Chat";
import Feed from "./pages/Feed/Feed";
import Friends from "./pages/Friends/Friends";
import PendingRequests from "./pages/PendingRequests/PendingRequests";
import Navbar from "./components/common/Navbar/Navbar";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: "60px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/friends/pending" element={<PendingRequests />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
