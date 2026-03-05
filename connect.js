import mongoose from "mongoose";

async function ConnectDb(url) {
    return await mongoose.connect(url);
}

export {ConnectDb};