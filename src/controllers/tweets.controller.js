import mongoose, { isValidObjectId } from "mongoose"
import Tweet from "../models/tweets.model.js"
import User from "../models/user.model.js"
import {ApiError} from "../utils/APIerrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async(req,res)=>{
    const {content} =req.body;
    const owner = req.user._id;
    if(!content){
        throw new ApiError(400,"No content")
    }
    const tweet = await Tweet.create({
        owner:owner,
        content:content
    })

    return res.status(200)
    .json(new ApiResponse(200,tweet,"Created a tweet"))
})

const getUserTweets= asyncHandler(async(req,res)=>{
     const userId = req.user._id;
     const user =await User.findById(userId);
     if(!user){
        throw new ApiError(400,"User not exists")
     }
     const tweets = await Tweet.find({
        owner:userId
     })
     return res.status(200)
     .json(new ApiResponse(200,tweets,"all the tweets successfully fetched"))
})

const updateTweet = asyncHandler(async(req,res)=>{
  const {tweetid}= req.params;
  const {content}= req.body;
  const tweet = await Tweet.findById(tweetid)
  if(!tweet){
    throw new ApiError(400,"Not valid Tweet");
  }
  if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
  tweet.content=content;
  await tweet.save()
  return res.status(200)
  .json(new ApiResponse(200,tweet,"Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"NO such tweet exists")
    }
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"NO deletion authorized")
    }
    await Tweet.findByIdAndDelete(tweetId);
    return  res.status(200)
    .json(new ApiResponse(200,{},"Deleted successfully"))
})

export {
createTweet,
getUserTweets,
updateTweet,
deleteTweet
}