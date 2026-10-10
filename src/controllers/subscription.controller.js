import mongoose, {isValidObjectId} from "mongoose"
import User from "../models/user.model.js"
import  Subscription  from "../models/subscription.model.js"
import {ApiError} from "../utils/APIerrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    const channel =await  User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"No such channel exists")
    }
    const subscriber = req.user._id ;
    const issubscribed =await Subscription.findOne({subscriber,channel:channelId});
    if(issubscribed){
       const id = issubscribed._id ;
       await Subscription.findByIdAndDelete(id);
    }
    else{
        const nwsubs = await Subscription.create({
            subscriber,
            channel:channelId
        })

    }
    return res.status(200)
    .json(new ApiResponse(200,{},"Subscription toggled"))

})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const channelId = req.user._id;
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400,"No channel found")

    }
    const subs = await Subscription.find({
        channel:channelId
    }).populate("subscriber");
    
    return res.status(200)
    .json(new ApiResponse(200,subs,"The subscribers found succesfully"))
    
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
   const subsId = req.user._id;
   const subs = await User.findById(subsId);
   if(!subs){
    throw new ApiError(400,"No such subscriber exist")
   }  
   const channels = await Subscription.find({
    subscriber:subsId
   }).populate("channel")

   return res.status(200)
   .json(new ApiResponse(200,channels,"The channels subscribed"));

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}