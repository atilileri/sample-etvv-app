import cors from "cors";
import "dotenv/config";
import express from 'express';
import { routes as rt} from "../../common/common.js";
const apiRouter = express.Router();

// Importing all the routes 
import {router as sptRouter} from "./routes/Spotify.js";
import {router as ytmRouter} from "./routes/YoutubeMusic.js";

// initialize express app
const app = express();

app.use(cors()); // enable `CORS` for all routes
app.use(express.json()); // enable parsing of json request body
app.use(express.urlencoded({ extended: true })); 
app.use(`/${rt.api}`, apiRouter);

// set the port and provide fallback 
// process.env is how we access environment variables with dotenv
const PORT = process.env.PORT || 3001;

// route handler to accept GET requests to `/api`
apiRouter.get('/', (_req, res) => {
    res.status(200).json({ message: 'Hello from the APIs!' });
})
// route handlers for different platform APIs
apiRouter.use(`/${rt.spotify}`, sptRouter);
apiRouter.use(`/${rt.youtubeMusic}`, ytmRouter);

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});