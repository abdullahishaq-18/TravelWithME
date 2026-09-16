import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import MeetupDetail from "./pages/MeetupDetail";
import ChatList from "./pages/ChatList";
import ChatThread from "./pages/ChatThread";
import Rating from "./pages/Rating";
import Notifications from "./pages/Notifications";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/meetups/:id" element={<ProtectedRoute><MeetupDetail /></ProtectedRoute>} />
      <Route path="/meetups/:id/rate" element={<ProtectedRoute><Rating /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ChatThread /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
