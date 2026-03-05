import express from "express"



const port = 8000;
const url = "";
const app = express();

//middlewares

app.use(express.urlencoded({extended:false})); // parse form data 
app.use(express.json) // use to handle client json Data while http requestsss

// routes

// DB connecting

//server connecting
app.listen(port,(err)=>{
    try {
        console.log(`Server is live at Port: ${port}`);
        
    } catch (error) {
        console.log(`Error in connecting the server  ${error}`);
        
    }
})