import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Table, Button, Container, ButtonGroup, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

// Render Backend URL
const API_BASE_URL = 'https://task4-backend-itransition.onrender.com';

function AdminPanel() {
    const { token, logout, user } = useContext(AuthContext); 
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            // Using central API base URL string
            const response = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert(err.response.data.error || 'Session invalidated.');
                logout();
            } else {
                setError('Failed to fetch users.');
            }
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const handleAction = async (actionType) => {
        if (selectedIds.length === 0) {
            alert("Please select at least one user first!");
            return;
        }

        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/${actionType}`, {
                ids: selectedIds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const currentUserId = user?.id; 
                const sessionShouldTerminate = (actionType === 'block' || actionType === 'delete') && selectedIds.includes(currentUserId);

                setSelectedIds([]);
                
                if (sessionShouldTerminate) {
                    alert(`Your account has been ${actionType}ed. Logging out.`);
                    logout();
                    return;
                }

                fetchUsers();
            }
        }catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert(err.response.data.error || "Action denied. Account blocked or deleted.");
                logout();
            } else {
                setError(err.response?.data?.error || `Failed to perform ${actionType} action.`);
            }
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = users.map(u => u.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4 text-secondary">User Management System</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-3 rounded shadow-sm">
                <ButtonGroup>
                    <Button variant="warning" className="text-white fw-bold" onClick={() => handleAction('block')}>Block</Button>
                    <Button variant="success" className="fw-bold ms-2" onClick={() => handleAction('unblock')}>Unblock</Button>
                    <Button variant="danger" className="fw-bold ms-2" onClick={() => handleAction('delete')}>Delete</Button>
                </ButtonGroup>
                <span className="text-muted fw-semibold">
                    Selected Rows: <strong>{selectedIds.length}</strong>
                </span>
            </div>

            <Table striped bordered hover responsive className="shadow-sm align-middle">
                <thead className="table-dark">
                    <tr>
                        <th style={{ width: '40px' }}>
                            <Form.Check 
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={users.length > 0 && selectedIds.length === users.length}
                            />
                        </th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Last Login</th>
                        <th>Registration Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className={user.status === 'blocked' ? 'table-danger' : ''}>
                            <td>
                                <Form.Check 
                                    type="checkbox"
                                    onChange={(e) => handleSelectOne(e, user.id)}
                                    checked={selectedIds.includes(user.id)}
                                />
                            </td>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{formatDate(user.last_login)}</td>
                            <td>{formatDate(user.registration_time)}</td>
                            <td>
                                <span className={`badge ${user.status === 'blocked' ? 'bg-danger' : 'bg-success'}`}>
                                    {user.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default AdminPanel;