import { Routes, Route } from "react-router-dom";
import ProtectedRoute  from "./components/ProtectedRoute";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";

// Placehoder Pages
const Register = () => <div style={{textAlign: 'center', marginTop: '50px'}}><h1>Register Page</h1></div>;
const Dashboard = () => <div style={{textAlign: 'center', marginTop: '50px'}}><h1>User Dashboard</h1></div>;
const OfficerDashboard = () => <div style={{textAlign: 'center', marginTop: '50px'}}><h1>Officer Dashboard</h1></div>;
const NotFound = () => <div style={{textAlign: 'center', marginTop: '50px'}}><h1>404 Not Found</h1></div>;

function App () {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED ROUTES (Must be logged in) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      
      {/* OFFICER ONLY ROUTES */}
      <Route element={<ProtectedRoute requireOfficer={true} />}>
        <Route path="/officer" element={<OfficerDashboard />} />
      </Route>

      {/* 404 CATCH ALL */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App;

