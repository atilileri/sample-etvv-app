// Spotify Handler 
// Importing express module 
import express from "express" 
// import { ParsedQs } from "qs";
export const router=express.Router() 

// Handling requests using router 
router.get("/",(_req,res,_next)=>{ 
    // res.send("This is the Spotify request");
    // todo - ai : check if we logged in
    // if not logged in, try logging in
    const redirectRoute = await redirectToSpotifyAuthorize();

    res.status(200).redirect(redirectRoute);
})
// callback after spotify authorization
router.get("/cb",(req, res,_next)=>{ 
    // todo - see what else is returned;
    // todo - handle failed auth
    console.log(req);
    const code = <string> req.query.code;
    const token = getToken(code);
    currentToken.save(token);
    res.status(200).redirect("/playlists");
})
// get user's playlists
router.get("/playlists",(_req,res,_next)=>{ 
    // todo - see what else is returned;
    // todo - handle failed auth
    // If we have a token, we're logged in, so fetch user data and render logged in template
    if (currentToken.access_token) {
        const userData = getUserData();
        res.status(200).json({ message: userData });
    }
    
    // Otherwise we're not logged in, so render the login template
    if (!currentToken.access_token) {
        // renderTemplate("main", "login");
  }
})

/* 
** Authorization Code with PKCE Flow
** https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

const clientId = '6ed196785dbb45bcb629ccc36aeab596'; // your clientId
const redirectUrl = 'eg:http://localhost:8080';        // your redirect URL - must be localhost URL and/or HTTPS

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-private user-read-email';

var codeVerif:string
var accessToken:string
var refreshToken:string
var expiresIn:number
var expireTime:Date;

// Data structure that manages the current active token, caching it in global parameters
const currentToken = {
    get access_token() { return accessToken; },
    get refresh_token() { return refreshToken; },
    get expires_in() { return expiresIn },
    get expires() { return expireTime },
  
    save: async function (response: Promise<any>) {
      const { access_token, refresh_token, expires_in } = await response;
      accessToken = access_token;
      refreshToken = refresh_token;
      expiresIn =  expires_in;
  
      const now = new Date();
      const expiry = new Date(now.getTime() + (expires_in * 1000));
      expireTime = expiry;
    }
  };

// Spotify API Calls
async function getToken(code: string) : Promise<JSON> {
    const code_verifier = codeVerif;
  
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUrl,
        code_verifier: code_verifier!, // todo - ai : check / make sure this is not null
      }),
    });
  
    return await response.json();
  }

async function redirectToSpotifyAuthorize() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  codeVerif = code_verifier;

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  return authUrl.toString(); // Redirect the user to the authorization server for login
}

async function getUserData() {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + currentToken.access_token },
    });
  
    return await response.json();
  }