const {sendEmail} = require('./sendEmail');

sendEmail({
    to: 'kinath.ru@gmail.com',
    from: 'kinathru@gmail.com',
    subject: 'Test Email',
    text: 'Some Text Content',
    html: '<h1>Some HTML Content</h1>'
}).then(() => {
    console.log('Email Sent');
}).catch(e => {
    console.log(e);
});