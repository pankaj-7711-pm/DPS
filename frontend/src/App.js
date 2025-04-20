import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRoute from './components/Routes/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import UserRoute from './components/Routes/UserRoute';
import DocView from './pages/user/DocView';

function App() {
  return (
    <>
      <Routes>
        <Route path="/dashboard" element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        <Route path="/dashboard" element={<UserRoute />}>
          <Route path="user" element={<UserDashboard />} />
        </Route>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/document/:did" element={<DocView />} />
      </Routes>
    </>
  );
}

export default App;
