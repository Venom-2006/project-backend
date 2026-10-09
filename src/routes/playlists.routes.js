import { createPlaylist,
   getUserPlaylist,
   getPlaylistById,
   addVideoToPlaylist,
   removeVideoFromPlaylist,
   deletePlaylist,
   updatePlaylist}  from '../controllers/playlist.controller.js'

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {Router} from 'express';


const router = Router()

router.route('/create-playlist').post(verifyJWT,createPlaylist)
router.route('/get-user-playlists').get(verifyJWT,getUserPlaylist)

router.route('/get-playlist-byid/:Playlistid').get(verifyJWT,getPlaylistById)

router.route('/add-video-to-playlist/:playlistId/:videoId').post(verifyJWT,addVideoToPlaylist)

router.route('/remove-video-from-playlist/:playlistId/:videoId').delete(verifyJWT,removeVideoFromPlaylist)

router.route('/delete-playlist/:PlaylistId').delete(verifyJWT,deletePlaylist)

router.route('/update-playlist/:PlaylistId').patch(verifyJWT,updatePlaylist)


export default router 