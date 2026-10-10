import mongoose from "mongoose"
import Comment from "../models/comments.model.js"
import Video from "../models/video.model.js"
import {ApiError} from "../utils/APIerrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import commentsModel from "../models/comments.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ video: videoId })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments retrieved successfully")
    );
});

const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {content} = req.body;
    if(!videoId){
        throw new ApiError(400,"video id required")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"NO such video exisits")
    }
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const newcomment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    return res.status(200)
    .json(new ApiResponse(200,newcomment,"comment added to the video successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const owner = req.user._id;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== owner.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }

    comment.content = content.trim();
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async(req,res)=>{
     const {commentId}= req.params
     if(!commentId){
        throw new ApiError("Comment id is required")
     }
     const comment = await Comment.findById(commentId)
     if(!comment){
        throw new ApiError(400,"NO such comment exists")
     }
     if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"No authorization")
     }
     await Comment.findByIdAndDelete(commentId)
     return res.status(200)
     .json(new ApiResponse(200,{},"comment removed successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}