import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/APIerrors.js';
import User from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse}  from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import Subscription from '../models/subscription.model.js';

const generateAccessAndRefreshToken =async(userID)=>{
   try{ const  user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken= refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}
   }
   catch(err){
    throw new ApiError(500,"Error generating access and refresh token")
   }
}

const registerUser= asyncHandler(async(req,res)=>{
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
  console.log("🔥 User:", User);
console.log("🔥 findOne:", typeof User.findOne);
console.log("🔥 findone:", typeof User.findone);

  const userExists = await User.findOne({
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

const loginUser= asyncHandler(async(req,res)=>{
       // take user details 
       // check if user exist 
       // check if password if correct 
       // generate access token and refresh token
       // send response with access token and refresh token
       const {email,username,password}=req.body;
       if(!username && !email){
        throw new ApiError(400,"Username or email is required")
       }
 

       const user = await User.findOne({
        $or:[{email},{username}]
       })
       if(!user){
        throw new ApiError(404,"User not found")
       }
       const isPasswordValid = await user.isPasswordCorrect(password)
       if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
       }
       const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
       const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
       const options={
        httpOnly:true,
        secure:true
       }
       return res.status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",refreshToken,options)
         .json(
            new ApiResponse(200,
                {
                    user:loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
         )

})


const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id
        ,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true 
        }
    )
    const options={
        httpOnly:true,
        secure:true
       }
       return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,null,"User logged out successfully")
       )
})

const  refreshAccessToken= asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken||req.body.refreshToken;

   if(!incomingRefreshToken){
    throw new ApiError(401,"Refresh token is required")
   }
 try{
   const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

   const user =await User.findById(decoded._id)
   if(!user){
    throw new ApiError(404,"User not found")
   }
   const options={
    httpOnly:true,
    secure:true
   }

   const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id)

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newrefreshToken,options)
   .json(
    new ApiResponse(200,
        {
            accessToken,
            refreshToken:newrefreshToken
        },
        "Access token refreshed successfully"
    )
   )
  }
  catch(err){
    throw new ApiError(401,err.message || "Invalid refresh token")
  }
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {currentPassword,newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.isPasswordCorrect(currentPassword)
    if(!isPasswordValid){
        throw new ApiError(401,"Current password is incorrect")
    }
    user.password = newPassword;
    // before save .pre hook will hash the password using bcrypt
    await user.save({validateBeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200,null,"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(
    new ApiResponse(200,req.user,"Current user fetched successfully")
  )
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName,email}= req.body;
  if(!fullName || !email){
    throw new ApiError(400,"Full name and email are required")
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        fullName,
        email
      }
    },
    {new:true}
  ).select("-password")
  return res.status(200).json(
    new ApiResponse(200,user,"Account details updated successfully")
  )
})

const updateAvatar = asyncHandler(async(req,res)=>{
   const avatarLocalPath = req.file.path;
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
   }

   const avatar =await uploadOnCloudinary(avatarLocalPath);
   if(!avatar){
    throw new ApiError(500,"Error uploading avatar")
   }

   const user = await User.findByIdAndUpdate(
    req.user._id,
    {$set:{
        avatar:avatar.url
    }},
    {new:true}
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200,user,"Avatar updated successfully")
  )

}) 

const updateCoverImage = asyncHandler(async(req,res)=>{
   const coverImageLocalPath = req.file.path;
   if(!coverImageLocalPath){
    throw new ApiError(400,"Cover image is required")
   }

   const coverImage =await uploadOnCloudinary(coverImageLocalPath);
   if(!coverImage){
    throw new ApiError(500,"Error uploading cover image")
   }

   const user = await User.findByIdAndUpdate(
    req.user._id,
    {$set:{
        coverImage:coverImage.url
    }},
    {new:true}
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200,user,"Cover image updated successfully")
  )

}) 

const getUserChannelProfile =asyncHandler(async(req,res)=>{
  const {username}= req.params;
  if(!username?.trim()){
    throw new ApiError(400,"Username is required")
  }
  const channel = await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from :"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{$size:"$subscribers"},
        subscribedToCount:{$size:"$subscribedTo"} ,
        isSubscribed:{$cond:{
          if:{$in:[req.user?._id,"$subscribers.subscriber"]},
          then:true,
          else:false
        }
        }
    }
  },
  {
    $project:{
      username:1,
      fullName:1,
      email:1,
      avatar:1,
      coverImage:1,
      subscribersCount:1,
      subscribedToCount:1,
      isSubscribed:1
    }
  }
  ]) 
  
  if(!channel?.length){
    throw new ApiError(404,"Channel not found")
  }
  return res.status(200).json(
    new ApiResponse(200,channel[0],"Channel profile fetched successfully")
  )
 
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
      {
        $match:{
          _id:new mongoose.Types.ObjectId(req.user._id)
        }

      }
      ,
      {
        $lookup:{
          from:"videos",
          localField:"watchHistory",
          foreignField:"_id",
          as:"watchHistory",
          pipeline:[{
           $lookup: {
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    username:1,
                    fullName:1,
                    avatar:1
                  }
                }
              ]
            }
          }
          ]
        }
      }
    ])
return res.status(200).json(
  new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully")
)
})

export {registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser
  ,updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
}