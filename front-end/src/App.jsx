import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router";
import {SignUpPage} from './SignUpPage';
import {LogInPage} from './LogInPage';
import {UserInfoPage} from './UserInfoPage';
import {PrivateRoute} from "./PrivateRoute.jsx";
import {useUser} from "./useUser.js";
import {PleaseVerifyEmailPage} from "./PleaseVerifyEmailPage.jsx";
import {EmailVerificationLandingPage} from "./EmailVerificationLandingPage.jsx";
import {ForgotPasswordPage} from "./ForgotPasswordPage.jsx";
import {PasswordResetLandingPage} from "./PasswordResetLandingPage.jsx";

function App() {

    const user = useUser();

    return (
        <div className="page-container">
            <BrowserRouter>
                <Routes>
                    <Route path="/log-in" element={<LogInPage/>}/>
                    <Route path="/sign-up" element={<SignUpPage/>}/>
                    <Route path="/please-verify" element={<PleaseVerifyEmailPage/>}/>
                    <Route path="/verify-email/:verificationString" element={<EmailVerificationLandingPage/>}/>
                    <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                    <Route path="/reset-password/:passwordResetCode" element={<PasswordResetLandingPage/>}/>

                    {/*Purpose of the private route is to redirect the user to the log-in page when the user tries to
                    access '/' path if the user is not authenticated*/}
                    <Route element={<PrivateRoute redirectPath="log-in" isAllowed={!!user}/>}>
                        <Route path="/" element={<UserInfoPage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
