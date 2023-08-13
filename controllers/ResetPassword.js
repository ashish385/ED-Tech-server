const User = require("../models/UserModel");
const nodeMailer = require("nodemailer");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// resetpassword token
exports.forgotPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const { email } = req.body;

        // email validation
        if (!email) {
            return res.status(402).json({
                success: false,
                message:"filed is required!"
            })
        }

        // check email exist or not
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json(
                {
                success:false,
                message:"user is not exist!"
            }
            )
        }

        // token generate
        const token = crypto.randomUUID();
        // update user by adding token and expries
        const updateDetails = await User.findOneAndUpdate(
            { email },
            {
                token: token,
                resetPasswordExpires:Date.now()+ 5*60*1000,
            },
            {
            new:true
            })
        
        // /create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);
        // return response
        return res.json({
            success: true,
            message:"Email sent successfully!, Please check mail and reset password."
        })


    } catch (error) {
        return res.json({
            success: false,
            message:"Something went wrong while sending email and reset password"
        })
    }
}

// reset password
exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { password, confirmPassword, token } = req.body;
        // validate
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message:"Password and ConfirmPassword not matching."
            })
        }
        // get user details from db using token
        const userDetails = await User.findOne({ token: token });
        // if no entry - invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message:"Invalid Token"
            })
        }
        // check token time
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message:"Token is expired, please regenerate next token",
            })
        }
        // hash password
        const hashPassword = await bcrypt.hash(password, 10);
        // password update
        await User.findOneAndUpdate({ token: token }, { password: hashPassword }, { new: true });
        // return response
        return res.status(200).json({
            success: true,
            message:"Password rest successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success: true,
            message:"something went wrong updating password!",
        })
    }
}