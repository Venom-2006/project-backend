import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/APIerrors.js';
import User from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse}  from '../utils/ApiResponse.js'

const registerUser= asyncHandler(async(req,res,next)=>{
  const {username,email,fullName,password}= req.body;
  //console.log("email: ",email);
  if(fullName===""){
    throw new ApiError(400,"Full name is required")
  }  
  if(username===""){
    throw new ApiError(400,"Username is required")
  }
  if(email===""){
    throw new ApiError(400,"Email is required")
  }
  if(password===""){
    throw new ApiError(400,"Password is required")
  }
  const userExists = await User.findone({
    $or:[{email},{username}]
  })
  if(userExists){
    throw new ApiError(409,"User with this email or username already exists")
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }
  const user = await User.create({
    username:username.toLowerCase(),
    email,
    fullName,
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url||""
   })

   const createdUser = await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
    throw new ApiError(500,"User not created")
   }
   return res.status(201).json(
    new ApiResponse(201,createdUser,"User registered successfully")
   )
})


export {registerUser}