const express = require('express');
const {db, saveDb} = require('./db');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const jwt = require('jsonwebtoken'); // Comes from `jsonwebtoken` library to support JWT generation
const cors = require('cors');
const {sendEmail} = require("./sendEmail");

const app = express();
const corsOptions = {
    origin: 'http://localhost:5174'
}

app.use(cors(corsOptions));
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
    const verificationString = uuidv4();
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
        isVerified: false,
        verificationString
    });

    saveDb();

    try {
        await sendEmail({
            to: email,
            from: "kinathru@gmail.com",
            subject: "Please verify your email",
            text: `Thanks for singing up! To verify your email, please click here:  http://localhost:5174/verify-email/${verificationString}`
        });
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }

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
    if (!user) {
        res.sendStatus(401);
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

// User info edit endpoint
app.put('/api/users/:userId', async (req, res) => {

    // Get the authorization header to validate if the user id in the params matches the user id in the token
    const {authorization} = req.headers; // Bearer <token>
    const {userId} = req.params;

    if (!authorization) {
        return res.status(401).json({message: "No authorization header sent"});
    }

    const user = db.users.find(user => user.id === userId);
    if (!user) {
        return res.sendStatus(404);
    }

    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({message: "Unable to verify token"});
        }

        const {id} = decoded;
        if (id !== userId) {
            return res.status(403).json({message: "Not allowed to update that user id"});
        }

        const {favoriteFood, hairColor, bio} = req.body;
        const updates = {favoriteFood, hairColor, bio}; // We do this here to avoid users sending properties outside what we expect in the request.

        user.info.favoriteFood = updates.favoriteFood || user.info.favoriteFood;
        user.info.hairColor = updates.hairColor || user.info.hairColor;
        user.info.bio = updates.bio || user.info.bio;

        saveDb();

        jwt.sign({
            ...user
        }, process.env.JWT_SECRET, {
            expiresIn: '2d'
        }, (err, token) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.json({token});
        });
    });
});

// Verify email token page
app.put('/api/verify-email', async (req, res) => {
    const {verificationString} = req.body;

    const user = db.users.find(u => u.verificationString === verificationString);
    if (!user) {
        return res.sendStatus(401).json({message: "Email verification code is not correct"});
    }

    user.isVerified = true;

    const {id, email, info, isVerified} = user;
    jwt.sign({
        id, email, info, isVerified
    }, process.env.JWT_SECRET, {
        expiresIn: '2d'
    }, (err, token) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.json({token});
    });

    saveDb();
});

// Forgot password endpoint
app.put('/api/forgot-password/:email', async (req, res) => {
    try {
        const {email} = req.params;

        const user = db.users.find(u => u.email === email);
        const passwordResetCode = uuidv4();

        if (!user) {
            return res.status(401).json({message: "Email verification code is not correct"});
        }

        user.passwordResetCode = passwordResetCode;

        try {
            await sendEmail({
                to: email,
                from: "kinathru@gmail.com",
                subject: "Password Reset",
                text: `To reset your password, click this link:  http://localhost:5174/reset-password/${passwordResetCode}`
            });
            saveDb();
            return res.sendStatus(200);
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    } catch (me) {
        console.log(me);
        return res.sendStatus(500);
    }
});


app.listen(3000, () => console.log('Server running on port 3000'));