const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/UserModel")
// auth
exports.auth = async (req, res) => {
    try {
        // check json web token
        // extract token
        const token = req.cookies.token || req.body || req.header("Authorisation").replace("Bearer ", "");

        // if token is missing , then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message:'Token is missing',
            })
        }

        // verify the token
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            res.user = decode;
        } catch (error) {
            // verification - issue
            return res.status(401).json({
                success: false,
                message:'token is missing'
            })
        }
        next();
    } catch (error) {
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
exports.isInstructor = async (req, res,next) => {
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