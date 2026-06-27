import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Builder from './pages/Builder';
import Assessments from './pages/Assessment';
import LaunchPad from './pages/Launchpad';
import Reports from './pages/Reports';
import ErrorBoundaryWrapper from './components/errorBoundary/ErrorBoundaryWrapper';

function App() {
  return (
    <ErrorBoundaryWrapper>
      <BrowserRouter>
        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#0D0C0A',
              color: '#fff',
              border: '2px solid #0D0C0A',
              borderRadius: '2px',
              fontFamily: 'Manrope, sans-serif',
            },
          }}
        />
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path='/' element={<Navigate to='/builder' replace />} />
            <Route path='/builder' element={<Builder />} />
            <Route path='/assessments' element={<Assessments />} />
            <Route path='/launchpad' element={<LaunchPad />} />
            <Route path='/launchpad/:id' element={<LaunchPad />} />
            <Route path='/reports' element={<Reports />} />
          </Route>
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundaryWrapper>
  );
}

export default App;
