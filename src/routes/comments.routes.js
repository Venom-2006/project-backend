import {
getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from '../controllers/comments.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {Router} from 'express';

const router = Router()

router.route('/get-video-comments/:videoId')
    .get(getVideoComments);

router.route('/add-comment/:videoId').post(verifyJWT,addComment)

router.route('/update-comment/:commentId').patch(verifyJWT,updateComment)

router.route('/delete-comment/:commentId').delete(verifyJWT,deleteComment)

export default router 