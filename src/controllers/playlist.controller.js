import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../models/playlist.model.js"
import Video from "../models/video.model.js"
import User from "../models/user.model.js"
import {ApiError} from "../utils/APIerrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist= asyncHandler(async(req,res)=>{
    const {name,description} = req.body;
    const owner = req.user._id;
    if(!name||!description){
     throw new ApiError(400,"name and description is required")
    }
      
    const newPlaylist = await Playlist.create({
        name,
        description,
        owner:owner
    }) 

    if(!newPlaylist){
        throw new ApiError(500,"Playlist creation error")
    }

    return res.status(200)
    .json(new ApiResponse(200,newPlaylist,"New playlist created"))

})


const getUserPlaylist = asyncHandler(async(req,res)=>{
    const owner = req.user._id;
    if(!owner){
        throw new ApiError(400,"No such user exists")
    }
    const Playlists = await Playlist.find({
        owner
    })

    return res.status(200)
    .json(new ApiResponse(200,Playlists,"found all playlists"))

})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {Playlistid}= req.params ;
    if(!Playlistid){
        throw new ApiError(400,"No such playlist exists")
    }
    const playlist = await Playlist.findById(Playlistid);
   
    if(!playlist){
        throw new ApiError(500,"error fetrching playlist")
    }
     const playlistowner = playlist.owner;
    if(playlistowner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"Not allowed access")
    }
    return res.status(200)
    .json(new ApiResponse(200,playlist,"successfully retrieved"))
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and video ID are required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check whether the logged-in user owns this playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    // Check whether the video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Prevent duplicate videos
    if (playlist.videos.some(id => id.toString() === videoId)) {
        throw new ApiError(400, "Video already exists in this playlist");
    }

    // Add the video and save
    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and video ID are required");
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(500,"Unable to fetch playlist")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(500,"Unable to fetch video")
    }

   const videoExists = playlist.videos.some(
        (id) => id.toString() === videoId
    );

    if(!videoExists){
        throw new ApiError(400,"No such video exisits")
    }

    playlist.videos = playlist.videos.filter(
        (id)=> id.toString()!==videoId
    )

    await playlist.save()
    return res.status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully" ))
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {PlaylistId} = req.params;
    if(!PlaylistId){
        throw new ApiError(400," playlist required")
    }
    const playlist = await Playlist.findById(PlaylistId)

    if(!playlist){
        throw new ApiError(500,"Unable to fetch")
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"NO authority to updations")
    }
 await Playlist.findByIdAndDelete(PlaylistId);
    return res.status(200)
    .json(new ApiResponse(200,{},"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {PlaylistId}= req.params;
    const {name ,description}= req.body;
    if(!PlaylistId){
        throw new ApiError(400,"PlaylistId is required")
    }
    if(!name||!description){
        throw new ApiError(400,"name and description needed")
    }
    const playlist = await Playlist.findById(PlaylistId);
    if(!playlist){
        throw new ApiError(500,"Unable to fetch")
    }
    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"User not authorized")
    }
    playlist.name = name ;
    playlist.description=description ;
    await playlist.save();
    return res.status(200)
    .json(new ApiResponse(200,playlist,"Updated successfully"))
})


export {
   createPlaylist,
   getUserPlaylist,
   getPlaylistById,
   addVideoToPlaylist,
   removeVideoFromPlaylist,
   deletePlaylist,
   updatePlaylist

}