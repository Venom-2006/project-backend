import mongoose,{isValidObjectId} from 'mongoose';
import Video from '../models/video.model.js';
import User from '../models/user.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/APIerrors.js';
import {ApiResponse}  from '../utils/ApiResponse.js'
import {uploadOnCloudinary}  from '../utils/cloudinary.js'

const getAllVideos = asyncHandler(async(req,res)=>{
    
    
})

const publishAVideo = asyncHandler(async(req,res)=>{
   const {title,description}=  req.body;
   const owner = req.user._id;
   const videoFile = req.files?.videoFile?.[0]?.path;
   const thumbnailFile = req.files?.thumbnailFile?.[0]?.path;
   
  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoUrl = await uploadOnCloudinary(videoFile);
  const thumbnailUrl = await uploadOnCloudinary(thumbnailFile);
  if(!videoUrl){
    throw new ApiError(500,"Not able to upload video")
  }
  if(!thumbnailUrl){
    throw new ApiError(500,"not able to upload thumbnail")
  }
  const video= await Video.create({
     videoFile:videoUrl.url,
     thumbnail:thumbnailUrl.url,
     title,
     description,
     owner
  })  
   
  return res.status(200)
          .json(new ApiResponse(201,video,"Video uploaded successfully"));

})

const getVideoById = asyncHandler(async(req,res)=>{ 
   const {videoId}= req.params;
   
   const video = await Video.findById(videoId);
   if(!video){
    throw new ApiError(400,"No such video exists")
   }

   return res.status(200).json(new ApiResponse(200,video,"video found"))


})


const updateVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"No such video exists")
    }
    const {title,description}= req.body;
    if(title){
        video.title=title;
    }
    if(description){
        video.description=description;
    }
    const localvideopath = req.files?.videoFile?.[0]?.path;
    const localthumbnailpath= req.files?.thumbnailFile?.[0]?.path;
    if(localvideopath){
        const newvideopath = await uploadOnCloudinary(localvideopath);
        if(!newvideopath){
            throw new ApiError(500,"Video not uploaded")
        }
        video.videoFile= newvideopath.url;
    }

    if(localthumbnailpath){
        const newthumbnailpath = await uploadOnCloudinary(localthumbnailpath)
        if(!newthumbnailpath){
            throw new ApiError(500,"Thumbnail not uploaded")
        }
        video.thumbnail= newthumbnailpath.url;
    }
    await video.save();
    return res.status(200)
    .json( new ApiResponse(200,video,"Video updated successfully"))


})

const deleteVideoById = asyncHandler(async(req,res)=>{
    const {videoId}= req.params;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video not found")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"User not verified")
    }
    await Video.findByIdAndDelete(videoId);
    return res.status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoById,
    deleteVideoById
}