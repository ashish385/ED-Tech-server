const User = require("../models/UserModel");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// send otp
exports.senOTP = async (req, res) => {
    try {
        // fetch email from request ki body
        const { email } = req.body;
        
        // check if user already exist or not
        const userPresent = await User.findOne({ email });

        // if user already exist then return a response
        if (userPresent) {
            return res.status(401).json({
                success: false,
                message:"User already registered!"
            })
        }

        // generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars:false,
        })
        console.log("otp generated", otp);
        
        // check unique otp or not
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars:false,
            })
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        // create an entery for OTP

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return status successfull
        res.status(200).json({
            success: true,
            message:"OTP sent successfully!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// signup
exports.signup = async (req, res) => {
    try {
        // data fetch kro
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        // validate karlo
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are rquired!"
            });

        }
        // 2 password match kr lo
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password  does not match, please try again"
            })
        }
        // check user already exist or not
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:"User is already registered!"
            })
        }

        // fint most recent OTP stored for user
        const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recent otp: ", recentOTP);
        
        // validate OTP
        if (recentOTP.length == 0) {
            // OTP not found
            return res.status(400).json({
                success: false,
                message:"OTP not found!"
            })
        } else if (otp !== recentOTP.otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message:"OTP not found!"
            })
        }

        // password hashed
        const hashedPassword = await bcrypt.hash(password, 10);

        
        // entery in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber:null
        })


        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            contactNumber,
            accountType,
            additionalDetails: profileDetails,
            image:`https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`
        })
        
        // send res
        res.status(200).json({
            success: true,
            message: "User registered Successfully!",
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User can't be registered, Please try again! ",
        })
    }
}

// login
exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;
        // validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message:"All fields are require",
            })
        }
        // user exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message:"User is not registered, Please signup first"
            })
        }
        // generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(otpPayload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined
            
            // create cookie  and send response
            const options = {
                expires: new Date(Date.now() + 3 * 34 * 60 * 60 * 1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                message:"Login Successfully!"
            })
        } else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }
        
        
    } catch (error) {
         console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failure, Please try again! ",
        })
    }
}

// forgot password
exports.changePassword = async (req, res) => {
    // get data from req body
    // get oldPassword, newPassword, confirmPassword
    // validation

    // update password in db
    // send mail - password update
    // return response
}