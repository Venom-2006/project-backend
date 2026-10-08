import { toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels}  from '../controllers/subscription.controller.js'

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {Router} from 'express';


const router =Router();

router.route('/toggle-subscription/:channelId').post(verifyJWT,toggleSubscription)

router.route('/get-subscribers').get(verifyJWT,getUserChannelSubscribers)

router.route('/get-channels-subscribed').get(verifyJWT,getUserChannelSubscribers)

export default router ;