import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

// Render Backend URL
const API_BASE_URL = 'https://task4-backend-itransition.onrender.com';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError(''); 

        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, {
                email,
                password
            });

            if (response.data.success) {
                login(response.data.user, response.data.token);
                alert('Login Successful!');
            }
        } catch (err) {
            console.dir(err);
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }} className="p-4 shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 mb-3">
                            Sign In
                        </Button>
                        <p className="text-center small text-muted mb-0">
                            Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-semibold">Register here</Link>
                        </p>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login;