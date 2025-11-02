const {google} = require("googleapis");
const {axios} = require("axios");
const {db, saveDb} = require("./db");

const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/auth/google/callback'
);

const getGoogleOAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    return oauthClient.generateAuthUrl(
        {
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes
        }
    );
}

/*
* This is a secret code here that Google gives us to prove that a user has logged into our site and, well,
* basically agreed that we can use their data.
*/
const getGoogleUser = async (code) => {
    const {tokens} = await oauthClient.getToken(code);
    const {response} = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userInfo?alt=json&access_token=${tokens.access_token}`,
        {
            headers: {
                Authorization: `Bearer ${tokens.id_token}`
            }
        }
    );
    return response.data;
}

const updateOrCreateUserFromOAuth = async (oauthUserInfo) => {
    const {
        id: googleId,
        verifiedEmail: isVerified,
        email
    } = oauthUserInfo;

    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
        existingUser.id = googleId;
        existingUser.isVerified = isVerified || existingUser.isVerified;
        saveDb();
        return existingUser;
    } else {
        let newUser = {
            email,
            googleId,
            isVerified,
            info: {}
        };
        db.users.push(newUser);
        saveDb();
        return newUser;
    }
};

module.exports = {getGoogleOAuthUrl, getGoogleUser, updateOrCreateUserFromOAuth};