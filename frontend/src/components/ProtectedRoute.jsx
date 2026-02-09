import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requireOfficer = false }) => {
    const { user, isOfficer, loading } = useAuth();

    // 1. show loading while checking auth
    if (loading) return <div>Loading...</div>;

    // 2. if not logged in -> Redirect to login
    if (!user) {
        return <Navigate to='/' replace />;
    }

    // 3. if officer role required but user connects as citizen -> redirect
    if (requireOfficer && !isOfficer) {
        return <Navigate to='/dashboard' replace />;
    }

    // 4. if all good -> render the child route (outlet)
    return <Outlet />;
}

export default ProtectedRoute;