import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Users } from './pages/Users';
import { UserHistory } from './pages/UserHistory';
import { getAuthToken } from './services/api';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAuthToken();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/user-history" 
          element={
            <PrivateRoute>
              <UserHistory />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
