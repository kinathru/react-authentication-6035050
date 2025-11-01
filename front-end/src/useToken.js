import {useContext, useState} from "react";
import {TokenContext} from "./TokenContext";

/**
 * A (custom) hook that returns a token and a function to set the token.
 * The token is stored in local storage and is initially set to the value
 * stored in local storage. The setToken function updates the token in local
 * storage and re-renders the component with the new token.
 *
 * @returns {[string, (newToken: string) => void]} A tuple containing the current token and
 * a function to set the token.
 */
export const useToken = ()=> useContext(TokenContext);