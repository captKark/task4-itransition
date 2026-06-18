import AdminPanel from './pages/AdminPanel';

import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { token, logout } = useContext(AuthContext);

  return (
    <Router>
      {/* GLOBAL NAVIGATION BAR */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Vault Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {/* If the user is NOT logged in, show Auth options */}
              {!token ? (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/users">User Dashboard</Nav.Link>
                  <Button variant="outline-danger" size="sm" className="ms-2" onClick={logout}>
                    Logout
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* (ROUTES) */}
      <Container>
        <Routes>
          {/* Public Gates */}
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/users" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/users" />} />

          {/* */}
          <Route path="/users" element={token ? <AdminPanel /> : <Navigate to="/login" />} />
          {/* Fallback Route: If user type any random path, redirect */}
          <Route path="*" element={<Navigate to={token ? "/users" : "/login"} />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;