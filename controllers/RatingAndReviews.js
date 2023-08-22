const RatingAndReview  = require('../models/RatingAndReviewSchema');
const Course = require('../models/CourseSchema');
const { mongo, default: mongoose } = require('mongoose');


// create rating
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;
        // fetch data
        const { rating, review, courseId } = req.body;
        // check user enrolled or not
        const courseDetails = await Course.findOne(
                                            {_id:courseId,
                                             studentEnrolled: {$elemMatch:{$eq:userId}}
                                            }
                                            )
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message:"Student is not enrolled in this course!"
            })
        }
        // check user already enrolled or not
        const alreadyReviewed = await RatingAndReview.findOne({ user: userId, course: courseId });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message:"Course is already reviewed by the user"
            })
        }
        // create review and rating
        const ratingReview = await RatingAndReview.create({
                                                user:userId,
                                                rating,review,
                                                course:courseId
                                            })
        // update course with review and rating
        const updateCourse = await Course.findByIdAndUpdate({ _id: courseId }, { $push: { ratingAndReviews: ratingReview._id } }, { new: true });
        console.log(updateCourse);

        // return response
        return res.status(200).json({
                success: true,
                message: "Rating and Review successfully",
                ratingReview
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
                success: false,
                message:error.message
            })
    }
}


// average rating
exports.getAverateRating = async (req, res) => {
    try {
        // get courseId
        const { courseId } = req.body.courseId;

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course:new mongoose.Schema.Types.ObjectId(courseId)
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        // return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating:result[0].averageRating,
            })
        }

        // if no rating/Review exist
        return res.status(200).json({
                success: true,
                message:"Average rating is 0, no review and rating",
                averageRating:0,
            }) 
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
                success: false,
                message:error.message
            })
    }
}


// get all rating
exports.getAllRatingAndReviews = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
                                            .sort({rating:"desc"})
                                            .populate({
                                                path: "user",
                                                select:"firstName lastName email image",
                                            })
                                            .populate({
                                                path: "course",
                                                select:"courseName"
                                            })
                                            .exec()
                                            
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully!",
            data:allReviews
        })
    } catch (error) {
        return res.status(500).json({
                success: false,
                message:error.message
            })
    }
}

// get courseId rating and review