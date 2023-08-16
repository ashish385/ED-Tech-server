const Course = require("../models/CourseSchema");
const Category = require("../models/CategorySchema");
const User = require("../models/UserModel");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tags, category } = req.body;
        // category = ObjectId

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price ||!tags || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All field are required!"
            })
        }

        // check for Instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details ", instructorDetails);
        //  ? verify ther user._id and instructorDetails._id are same or different?
        
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found!"
            })
        }
        
        // tag validate tag = objectId
        const categoryDetails = await Category.findById(tag)

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details not found!"
            })
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create an entery for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tags:tags,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        // update user -> add new course to the user schema of instructor
        // first parameter use for search by id , second paramete update the course,
        // and new use for return updated array
        await User.findByIdAndUpdate({ _id: instructorDetails._id },
            {
                $push: newCourse._id
            },
            { new: true }
        );

        // update tag Schema
        await Category.findByIdAndUpdate({ _id: categoryDetails._id },
            {
                $push: newCourse.category
            },
            { new: true },
        );

        return res.json({
            success: true,
            message: "Course created successfully!",
            data: newCourse
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "something went wrong!"
        })
    }
};

// get all courses handler function
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            courseDescription: true,
            price: true,
            tags:true,
            thumbnails: true,
            ratingAndReviews: true,
            studentEnrolled: true
        })
            .populate("Instructor")
            .exec();
        
        return res.json({
            success: true,
            message: "Data for all courses fetched successfuly!",
            data:allCourses
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "cannot fetch course data!",
            error:error.message,
        })
    }
}