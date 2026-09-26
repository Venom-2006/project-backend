import mongoose from 'mongoose';

const connectDB = async ()=>{
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`MongoDB connected !! DB HOST: ${connectioninstance.connection.host}`)
    } catch (error) {
        console.log("MONGO DB ERROR HAS OCCURED: ",error);
        process.exit(1);
    }
}

export default connectDB;