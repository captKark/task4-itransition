const express = require('express');
const cors = require('cors');
const pool = require('./db'); // import 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


require('dotenv').config();

const app = express();

// ---MiddleWare-- //
app.use(cors());
app.use(express.json());
app.use(cors({ origin: "https://task4-frontend-itransition.onrender.com/login" }));


//---Test Route---//
app .get('/test-route',  async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.json({success: true, time: result.rows[0].now})
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({error: 'Database connection Failed'});
    }   
});

//---Registration EndPoint Route---//
app.post('/api/registration', async (req, res) =>{
    try{
        const {name, email, password} = req.body;
        // Hash Password. Salt round=10 => industry standard
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users(name,email,password_hash)
            VALUES($1, $2, $3)
            RETURNING id, name, email, status`,
            [name, email, hashedPassword]
        );
        res.json({success:true, user:newUser.rows[0]});
    }
    catch(err){
        console.error(err.message);
        if (err.code==='23505'){
            return res.status(400).json({error: 'Email already exists'})
        }res.status(500).json({error: 'Server Error'}); 
    }
});


//---Security Checkpoin (Middleware)---//

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer', '').trim();

    if (!token){
        return res.status(401).json({error: 'Access denied. No Token provided.' })
    }
    try{
        // Cryptographically verify the token hasnot been forged
        const decoded= jwt.verify(token, process.env.JWT_SECRET);

        // Check db to see if user stil exists and is not bloked
        const userResult = await pool.query(`SELECT status FROM users WHERE id=$1`, [decoded.id])

        // Check if users were deleted
        if (userResult.rows.length === 0){
            return res.status(401).json({error: 'User no longer exists'}) // deleted
        }
        if (userResult.rows[0].status === 'blocked'){
            return res.status(403).json({error: 'Your account is blocked'}) // blocked  
        }

        // Attach User's id to the request and allow them to pass to the next route
        req.user = decoded;
        next();
    }
    catch(err){
        console.error("3. JWT CRASH REASON:", err.name, "-", err.message);
        res.status(401).json({error: 'Invalid Token'})
    }
}


//---Login Endpoint Route---//

app.post('/api/login', async (req,res)=>{
    try{
        const {email,password} = req.body;
        // Check if user exists in the database
        const userResult = await pool.query(
            `SELECT * FROM users WHERE email = $1`,[email]);
        if (userResult.rows.length === 0){
            // 401 = Unauthorized
            return res.status(401).json({error: 'Invalid email or password'})
        }
        const user = userResult.rows[0];    

        // Check if User is blocked
        if (user.status ==='blocked'){
            // 403 = Forbidden
            return res.status(403).json({error: 'Your email has been Blocked'})
        }

        // Compare the typed password with the hashed password in the db

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch){
            return res.status(401).json({error:'Invalid email or password'});
        }
        // Update last_login timestamp
        await pool.query(`UPDATE users SET last_login = NOW() WHERE id=$1`, [user.id]);
        
        // Generate JWT for user logged in
        // Pack their ID & Status into the token so the server can read it later
        const token = jwt.sign(
            {id:user.id, status:user.status},
            process.env.JWT_SECRET ,
            {expiresIn:'1h'}
        );

        // Send the token and user info back to the browser
        res.json({
            success:true,
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email:user.email,
                status: user.status
            }
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({error: 'Server Error'});
    }
});


//---Admin Endpoint: Get ALL users---//

app.get('/api/users', verifyToken, async (req,res)=>{
    try{
        // data in the table must be sorted
        const users = await pool.query(
            `SELECT id,name,email,last_login,registration_time,status FROM users ORDER BY last_login DESC NULLS LAST`
        );
        res.json({success:true, users:users.rows});
    }catch(err){
        console.error(err.message);
        res.status(500).json({error: 'Server Error'});
    }
});

//---Admin Endpoint: BULK BLOCK USERS---//
app.post('/api/users/block', verifyToken, async (req, res) => {
    try {
        const { ids } = req.body; // Extract the array of IDs sent by React

        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: 'No user IDs provided' });
        }

        await pool.query(
            `UPDATE users SET status = 'blocked' WHERE id = ANY($1)`,
            [ids]
        );

        res.json({ success: true, message: 'Users blocked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

//---Admin Endpoint: BULK UNBLOCK USERS---//
app.post('/api/users/unblock', verifyToken, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: 'No user IDs provided' });
        }

        await pool.query(
            `UPDATE users SET status = 'active' WHERE id = ANY($1)`,
            [ids]
        );

        res.json({ success: true, message: 'Users unblocked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

//---Admin Endpoint: BULK DELETE USERS---//
app.post('/api/users/delete', verifyToken, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: 'No user IDs provided' });
        }
        await pool.query(
            `DELETE FROM users WHERE id = ANY($1)`,
            [ids]
        );

        res.json({ success: true, message: 'Users deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

//--------------------------------------------------------------------------------------------//

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running on Port: ${PORT}`);
});


