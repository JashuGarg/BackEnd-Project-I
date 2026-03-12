import express from "express";
import path from "path";
import userRouter from "./routes/user.routes.js";
import { log } from "console";

const port = 8000;
const url = "";
const app = express();

//middlewares

app.use(express.urlencoded({extended:false})); // parse form data 
app.use(express.json()); // use to handle client json Data while http request
app.use(express.static(path.join(process.cwd(), "public")));
//

// routes
app.use("/", userRouter);

// server connecting
app.listen(port,()=>{
    try {
        console.log(`Server is running at port: ${port}`);
        console.log("Link: http://localhost:8000/");
        
    } catch (error) {
        console.log("Error while connecting to the server: ", error);
    }
})