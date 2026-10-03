import {ApiError}  from '../utils/APIerrors.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    if(!token){
        throw new ApiError(401,"Access token is required")
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401,"Invalid access token")
    }
    req.user=user ;
    next();
}
catch(err){
    throw new ApiError(401,err?.message || "Invalid access token")
}
})
