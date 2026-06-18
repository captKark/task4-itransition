import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear out old errors
        setSuccess(false); // Reset success state

        try {
            const response = await axios.post('http://localhost:5000/api/registration', {
                name,
                email,
                password
            });

            if (response.data.success) {
                setSuccess(true);
                // Clear the form fields completely upon successful creation
                setName('');
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Server error occurred during registration.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }} className="p-4 shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Create Account</h2>
                    
                    {/* Conditional Banners based on Server Response */}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Account created successfully! You can now log in.</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formRegisterName">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRegisterEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formRegisterPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Create password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Button variant="success" type="submit" className="w-100">
                            Register
                        </Button>
                        <p className="text-center small text-muted mb-0">
                            Already have an account? <Link to="/login" className="text-success text-decoration-none fw-semibold">Login here</Link>
                        </p>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register;