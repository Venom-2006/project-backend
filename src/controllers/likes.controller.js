import mongoose, {isValidObjectId} from "mongoose"
import Like from '../models/likes.model'
import Video from '../models/video.model.js'
import Comment from '../models/comments.model.js'
import Tweet from '../models/tweets.model.js'
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const user= req.user._id;
    if(!videoId){
        throw new ApiError(400,"No video id")
    } 
    const existVideo= await Video.findById(videoId)
    if(!existVideo){
        throw new ApiError(400,"No such video exists")
    }
    const Liked = await Like.findOne({
        video:videoId,
        likedBy:user
})
    if(Liked){
      await Like.findByIdAndDelete(Liked._id)

      return res.status(200)
      .json(new ApiResponse(200,{},"Like removed on this video"))
    }
  
    const newLike =await Like.create({
       video:videoId,
       likedBy:user
    })

    return res.status(200)
    .json(new ApiResponse(200,newLike,"Liked the Video successfully"))

})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user._id;

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    // Check whether the comment exists
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check whether this user has already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: user
    });

    if (existingLike) {
        // Remove the comment like
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment unliked successfully")
        );
    }

    // Create a new comment like
    const newLike = await Like.create({
        comment: commentId,
        likedBy: user
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Comment liked successfully")
    );
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user._id;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    // Check whether the tweet exists
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check whether the user has already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: user
    });

    if (existingLike) {
        // Unlike the tweet
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
        );
    }

    // Like the tweet
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: user
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Tweet liked successfully")
    );
});

const getLikedVideos = asyncHandler(async(req,res)=>{
    const likedby = req.user._id ;
    
    const likedvideo = await Like.find({
        likedBy:likedby,
        video:{$exists:true,$ne:null}
    }).populate("video")

    return res.status(200)
    .json(new ApiResponse(200,likedvideo,"The liked videos are retrieved"))

})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos

}