// Spotify Handler 
import express from "express" 
export const router=express.Router() 
var SpotifyWebApi = require('spotify-web-api-node');

// // Handling requests using router 
// router.get("/",(_req,res,_next)=>{ 
//     // res.send("This is the Spotify request");
//     // todo - ai : check if we logged in
//     // if not logged in, try logging in
//     const redirectRoute = redirectToSpotifyAuthorize();

//     res.status(200).redirect(redirectRoute);
// })
// // callback after spotify authorization
// router.get("/cb",(req, res,_next)=>{ 
//     // todo - see what else is returned;
//     // todo - handle failed auth
//     console.log(req);
//     const code = <string> req.query.code;
//     const token = getToken(code);
//     currentToken.save(token);
//     res.status(200).redirect("/playlists");
// })
// // get user's playlists
// router.get("/playlists",(_req,res,_next)=>{ 
//     // todo - see what else is returned;
//     // todo - handle failed auth
//     // If we have a token, we're logged in, so fetch user data and render logged in template
//     if (currentToken.access_token) {
//         const userData = getUserData();
//         res.status(200).json({ message: userData });
//     }
    
//     // Otherwise we're not logged in, so render the login template
//     if (!currentToken.access_token) {
//         // renderTemplate("main", "login");
//   }
// })


const clientId = '6ed196785dbb45bcb629ccc36aeab596'; // your clientId
const clientSecret = '496304503b04439abfc94fee11330408'
// const redirectUrl = 'http://localhost:5173/spt/cb';        // your redirect URL - must be localhost URL and/or HTTPS

// const authorizationEndpoint = "https://accounts.spotify.com/authorize";
// const tokenEndpoint = "https://accounts.spotify.com/api/token";
// const scope = 'user-read-private user-read-email';

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

const spotifyApi = new SpotifyWebApi({
  redirectUri: 'http://localhost:5173/spt/cb',
  clientId: clientId,
  clientSecret: clientSecret
});

router.get("/",(_req,res,_next)=>{ 
  res.status(200).json({ authURL: spotifyApi.createAuthorizeURL(scopes) });

  // res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

router.get("/cb",(req,res,_next)=>{ 
  const error = req.query.error;
  const code = req.query.code;
  // const state = req.query.state;
  console.log("cb");
  console.log(code);

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data: { body: { [x: string]: any; }; }) => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfullasdy retreived access token. Expires in ${expires_in} s.`
      );
      
        // Get the authenticated user
  spotifyApi.getMe()
  .then(function(data:any) {
    console.log('Some information about the authenticated user', data.body);
    res.status(200).json({ userInfo: data.body });

  }, function(err:any) {
    console.log('Something went wrong!', err);
  });
      // res.send('Success! You can now close the window.');
      
      // setInterval(async () => {
        //   const data = await spotifyApi.refreshAccessToken();
        //   const access_token = data.body['access_token'];
        
        //   console.log('The access token has been refreshed!');
        //   console.log('access_token:', access_token);
        //   spotifyApi.setAccessToken(access_token);
        // }, expires_in / 2 * 1000);
    })
    .catch((error: any) => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
    
    console.log("Get User 2")
  // Get the authenticated user
  spotifyApi.getMe()
    .then(function(data:any) {
      console.log('Some information about the authenticated user', data.body);
    }, function(err:any) {
      console.log('Something went wrong!', err);
    });
});