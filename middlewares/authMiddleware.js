const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User")
// auth
exports.auth = async (req, res, next) => {
        //extract token
        const tokens = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer", "");

    // console.log("token",tokens);
    try {
        // check json web token
        // console.log(req.cookies.token);
        // extract token
         console.log("BEFORE ToKEN EXTRACTION");
        //extract token
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer ", "");
        console.log("AFTER ToKEN EXTRACTION");

        // if token is missing , then return response
        // console.log("auth-token",token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message:'Token is missing',
            })
        }

        // verify the token
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log("decode",decode);
            req.user = decode;
        } catch (error) {
            // verification - issue
            console.log(error);
		console.log(error.message);
            return res.status(402).json({
                success: false,
                message:'token is missing'
            })
        }
        next();
    } catch (error) {
        console.log(error);
        console.log(error.message);
        return res.status(401).json({
            success: false,
            message:"Something went wrong while validating the token",
        })
    }
}


// isStudent
exports.isStudent = async (req, res,next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message:"This is a protected route for Students only"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"User role cannot be verified, try again",
        })
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    console.log("instructor");
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message:"This is a protected route for Instructor only"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"User role cannot be verified, try again",
        })
    }
}

// isAdmin
exports.isAdmin = async (req, res,next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message:"This is a protected route for Admin only"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"User role cannot be verified, try again",
        })
    }
}