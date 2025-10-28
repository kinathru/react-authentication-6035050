import {useState, useEffect} from "react";
import {useToken} from "./useToken.js";

export const useUser = () => {
    const [token] = useToken();

    const getPayloadFromToken = token => {
        const encodePayload = token.split('.')[1];
        return JSON.parse(atob(encodePayload));
    }

    const [user, setUser] = useState(() => {
        if (!token)
            return null;

        return getPayloadFromToken(token);
    });

    useEffect(() => {
        if (!token) {
            setUser(null);
        } else {
            setUser(getPayloadFromToken(token));
        }
    }, [token]);

    return user;
}