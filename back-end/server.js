const express = require('express');
const {db, saveDb} = require('./db');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const jwt = require('jsonwebtoken'); // Comes from `jsonwebtoken` library to support JWT generation


const app = express();
app.use(express.json());

// Endpoints go here

// Sign up endpoint
app.post('/api/sign-up', async (req, res) => {
    const {email, password} = req.body;

    // Make sure there's no user with the email already in the database
    const matching_user = db.users.find(user => user.email === email);
    if (matching_user) {
        return res.sendStatus(409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const startingInfo = {
        hairColor: "",
        favoriteFood: "",
        bio: "",
    }

    db.users.push({
        id,
        email,
        passwordHash,
        info: startingInfo,
        isVerified: false
    });

    saveDb();

    // Create a JWT token for the created user
    jwt.sign({
        id,
        email,
        info: startingInfo,
        isVerified: false
    }, process.env.JWT_SECRET, {
        expiresIn: '2d'
    }, (err, token) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.json({token});
    });
});

// Log in endpoint
app.post('/api/log-in', async (req, res) => {
    const {email, password} = req.body;

    const user = db.users.find(user => user.email === email);
    ;
    if (!user) {
        return res.status(401);
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.passwordHash);
    if (passwordIsCorrect) {
        const {id, email, info, isVerified} = user;

        // Create a JWT token for the logged-in user
        jwt.sign({
            id,
            email,
            info,
            isVerified
        }, process.env.JWT_SECRET, {
            expiresIn: '2d'
        }, (err, token) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.json({token});
        });
    } else {
        res.sendStatus(401);
    }
});


app.listen(3000, () => console.log('Server running on port 3000'));