import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/APIerrors.js';
import User from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse}  from '../utils/ApiResponse.js'


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

export {registerUser,loginUser,logoutUser}