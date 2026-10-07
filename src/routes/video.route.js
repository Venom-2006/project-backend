import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoById,
    deleteVideoById
} from "../controllers/video.controller.js";

import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all videos
router.get("/", getAllVideos);

// Get video by ID
router.get("/:videoId", getVideoById);

// Publish a video
router.post(
    "/",
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnailFile",
            maxCount: 1
        }
    ]),
    publishAVideo
);

// Update a video
router.patch(
    "/:videoId",
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnailFile",
            maxCount: 1
        }
    ]),
    updateVideoById
);

// Delete a video
router.delete(
    "/:videoId",
    verifyJWT,
    deleteVideoById
);

export default router;