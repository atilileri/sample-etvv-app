// Spotify Handler 
// Importing express module 
import express from "express" 
export const router=express.Router() 

// Handling request using router 
router.get("/",(_req,res,_next)=>{ 
    // res.send("This is the Spotify request");
    res.status(200).json({ message: 'This is the Spotify request!' });
}) 