const User = require("../models/UserModel");
const Profile = require("../models/ProfileSchema");

// don't need create profile because user already registerd

exports.updateProfile = async (req, res) => {
    try {
        // get data
        const { gender, dateOfBirth="", about="", contactNumber } = req.body;
        // get userId
        const id = req.user.id;
        // validation
        if (!gender || !contactNumber) {
            return res.status(400).json({
                success: false,
                message:"All field required!"
            })
        }
        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        // profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        // Save the updated profile
        await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "Profile Update Successfully!",
            profileDetails
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Profile can't be Update, Please try again!",
            error:error.message
        })
    }
}

// delete account
exports.deleteAccount = async (req, res) => {
	try {
		// TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
		const id = req.user.id;
		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.userDetails });
		// TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
		await user.findByIdAndDelete({ _id: id });
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully" });
	}
};

// get user details
exports.getAllUserDetails = async (req, res) => {
    try {
        // get id 
        const id = req.user.id;
        // validation and get user details
        const userDetails = await User.findById(id).populate("Profile").exec();
         // return response
        return res.status(200).json({
            success: true,
            message:"User data fetch successfully!"
        })
    } catch (error) {
         console.log(error);
        return res.status(500).json({
            success: false,
            message: "User data can't be fetch, Please try again!",
            error:error.message
        })
    }
}