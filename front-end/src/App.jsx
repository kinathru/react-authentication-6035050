import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router";
import {SignUpPage} from './SignUpPage';
import {LogInPage} from './LogInPage';
import {UserInfoPage} from './UserInfoPage';
import {PrivateRoute} from "./PrivateRoute.jsx";

function App() {
    return (
        <div className="page-container">
            <BrowserRouter>
                <Routes>
                    <Route path="/log-in" element={<LogInPage/>}/>
                    <Route path="/sign-up" element={<SignUpPage/>}/>

                    {/*Purpose of the private route is to redirect the user to the log-in page when the user tries to
                    access '/' path if the user is not authenticated*/}
                    <Route element={<PrivateRoute redirectPath="log-in" isAllowed={true}/>}>
                        <Route path="/" element={<UserInfoPage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
