const { instance } = require("../config/razorpay");
const Course = require("../models/CourseSchema");
const User = require("../models/UserModel");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require('../mail/templets/courseEnrollmentEmail');
const { default: mongoose } = require("mongoose");

// capture the payment and initiate the razorpay
exports.capturePayment = async(req,res) =>{
    
        // get course id and user id
        const { course_id } = req.body;
        const userId = req.user.id;
        // validation
        // valid userId
        if (!course_id) {
            return res.json({
                success: false,
                message:"Please provide vaild course ID",
            })
        };

        // valid CourseDetails
        let course;
        try {
            course = await Course.findById({ course_id });
            if (!course) {
                return res.json({
                success: false,
                message:"Could not find the course ",
            })
            }
            // user already paid for the same course
        // first convert userId(string) to ObjectId
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentEnrolled.includes(uid)) {
            return res.json({
                success: false,
                message:"Student is already enrolled!  ",
            })
        }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: false,
                message:error.message
            })
        }
        

        // order create
        const amount = course.price;
        const currency = "INR";

        /* */
        const options = {
            amount: amount * 100, /*mandatory */
            currency,               /*mandatory */
            receipt: Math.random(Date.now()).toString(),  /*optional */
            notes: {
                courseId: course_id,   /*optional object */
                userId,
            }
        }

        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            // return response

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,

            
        })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: false,
                message:"couldn't initate order"
            })
        }
        
    
}

// verufy signature of razorpay and server

exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.header["x-razorpay-signature"];

    // HMAC function (Hash-based Message Authentication Code)
    const shasum = crypto.createHmac("sha256", webhookSecret);

    // convert in string
    shasum.update(JSON.stringify(req.body));

    // next digest in hexadecimal form
    const digest = shasum.digest("hex");

    // match signature and digest
    if (signature === digest) {
        console.log("Payment is autorized");

        // update User -> courses and Coures ->studentEnroll

        // fetch courseId and userId
        const { courseId, userId } = req.body.payload.payment.entity.notes;

        try {
            // fullfill the action

            // find the course and enroll the student
            const enrollCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                {
                    $push: { studentEnrolled: userId }
                },
                {new:true}
            )
            if (!enrollCourse) {
                return res.staus(500).json({
                    success: false,
                    message:"Course not found"
                })
            }

            console.log(enrollCourse);

            // find the student and update the courses
            const enrolledStudent = await User.findOneAndUpdate(
                { userId },
                {
                    $push: {
                            courses:courseId
                    }
                },
                { new: true }
            )
            console.log(enrolledStudent);

            // send confirmation mail
            const emailResponse = mailSender(
                enrolledStudent.email,
                "Congratulations! from Codehelp",
                `Congratulations!, you have purchased this course ${enrollCourse.courseName} `
            )
            console.log(emailResponse);

            return res.status(200).json({
                success: true,
                message:"Signature Varified and course added"
            })
        } catch (error) {
          return res.staus(500).json({
                    success: false,
                    message:error.message
                })  
        }

    } else {
        return res.status(400).json({
            success: false,
            message:error.message
        })
    }
}
