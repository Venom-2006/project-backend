import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors());
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// Router 
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.route.js'
import tweetRouter from './routes/tweets.routes.js'
app.use('/api/v1/users',userRouter);
app.use('/api/v1/videos',videoRouter);
app.use('/api/v1/tweets',tweetRouter)




export default app;