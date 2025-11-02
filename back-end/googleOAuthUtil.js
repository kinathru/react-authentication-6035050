const {google} = require("googleapis");

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

module.exports = {getGoogleOAuthUrl};