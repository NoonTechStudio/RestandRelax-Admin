import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';

// Pages
import CreateAdmin from './pages/auth/createAdmin';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import Profile from './pages/auth/Profile';
import GetBookings from './components/Bookings/GetBookings';
import AddEditBooking from './components/Bookings/AddEditBooking';
import { Dashboard, Locations, Review, Memories, LocationForm } from "./pages";
import { AddLocation, GetLocations } from "./components/Locations";
import { AddReview, GetReviews } from "./components/Reviews";
import { AddImage, GetImages } from "./components/Memories";
import HomepageHeroManagement from "./components/HomepageHeroManagement";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/create" element={
  <ProtectedRoute>
    <AdminLayout>
      <CreateAdmin />
    </AdminLayout>
  </ProtectedRoute> 
}/>
          
          <Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />

          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />

          <Route path="/hero-image-management" element={
            <ProtectedRoute>
              <AdminLayout>
                <HomepageHeroManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Locations */}
          <Route path="/locations" element={
            <ProtectedRoute>
              <AdminLayout>
                <Locations />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/locations/new" element={
            <ProtectedRoute>
              <AdminLayout>
                <LocationForm />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/locations/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <LocationForm />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/get-locations" element={
            <ProtectedRoute>
              <AdminLayout>
                <GetLocations />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Reviews */}
          <Route path="/reviews" element={
            <ProtectedRoute>
              <AdminLayout>
                <Review />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/get-reviews" element={
            <ProtectedRoute>
              <AdminLayout>
                <GetReviews />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/reviews/new" element={
            <ProtectedRoute>
              <AdminLayout>
                <AddReview />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/reviews/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <AddReview />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Memories */}
          <Route path="/memories" element={
            <ProtectedRoute>
              <AdminLayout>
                <Memories />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/get-memories" element={
            <ProtectedRoute>
              <AdminLayout>
                <GetImages />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/images/new" element={
            <ProtectedRoute>
              <AdminLayout>
                <AddImage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/images/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <AddImage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
  <ProtectedRoute>
    <AdminLayout>
      <GetBookings />
    </AdminLayout>
  </ProtectedRoute>
} />

<Route path="/bookings/new" element={
  <ProtectedRoute>
    <AdminLayout>
      <AddEditBooking />
    </AdminLayout>
  </ProtectedRoute>
} />

<Route path="/bookings/edit/:id" element={
  <ProtectedRoute>
    <AdminLayout>
      <AddEditBooking />
    </AdminLayout>
  </ProtectedRoute>
} />



          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;