const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config();




// signup
exports.signup = async (req, res) => {
    try {
        // data fetch kro
        const { firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate karlo
        if (!firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp) {
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

        // Create the user
		let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);
        
        

        
        // Create the Additional Profile For User
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
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message:"User is not registered, Please signup first"
            })
        }
        // Generate JWT token and Compare Password
		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, id: user._id, role: user.role },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			// Save token to user document in database
			user.token = token;
			user.password = undefined;
			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
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


// send otp
exports.senOTP = async (req, res) => {
    try {
        // fetch email from request ki body
        const { email } = req.body;
        
        // Check if user is already present
		// Find user with provided email
		const checkUserPresent = await User.findOne({ email });
		// to be used in case of signup


       // If user found with provided email
		if (checkUserPresent) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
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
        console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);

        while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}

       const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);
		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// forgot password
// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};