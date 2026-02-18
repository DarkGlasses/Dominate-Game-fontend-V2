    import React from 'react';
    import { Navigate } from 'react-router-dom';

    const AdminRoute = ({ children }) => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || user.email !== 'admin@gmail.com') {
        return <Navigate to="/" replace />;
    }

    return children;
    };

    export default AdminRoute;