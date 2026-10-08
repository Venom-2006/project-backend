import {createTweet,
getUserTweets,
updateTweet,
deleteTweet}  from '../controllers/tweets.controller.js'

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {Router} from 'express';


const router =Router()

router.route('/create-tweet').post(verifyJWT,createTweet)

router.route('/get-user-tweets').get(verifyJWT,getUserTweets)

router.route('/update-tweet/:tweetid').patch(verifyJWT,updateTweet)

router.route('/delete-tweet/:tweetid').delete(verifyJWT,deleteTweet)


export default router;