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
import subscriptionRouter from './routes/subscriptions.routes.js'
import playlistRouter from './routes/playlists.routes.js'
import likeRouter from './routes/likes.routes.js'

app.use('/api/v1/users',userRouter);
app.use('/api/v1/videos',videoRouter);
app.use('/api/v1/tweets',tweetRouter)
app.use('/api/v1/subscriptions',subscriptionRouter)
app.use('/api/v1/playlists',playlistRouter)
app.use('/api/v1/likes',likeRouter)


export default app;