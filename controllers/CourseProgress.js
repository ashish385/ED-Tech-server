const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.updateCourseProgress = async (req, res) => {
    console.log(req.body);
    try {
        const { courseId, subSectionId } = req.body;
        const userId = req.user.id;

        const subSection = await SubSection.findById({ _id: subSectionId });

        if (!subSection) {
            return res.status(400).json({success:true,error:"Invalid Sub Section!"})
        }
        console.log("validation subsection");

        // check for old entery
        const courseProgress = await CourseProgress.findOne({
            courseId:courseId,userId:userId
        })

        if (!courseProgress) {
            console.log("course progress does not exist");
            return res.status(403).json({
                success: false,
                message:"course progress does not exist"
            })
        } else {
            console.log("check for re completing sub section");
            // check for re completing sub section
            if (courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({success:false,message:"SubSection already marked or completed!"})
            }
            // push subSection to completed videoes
            courseProgress.completedVideos.push(subSectionId)
        }

        console.log("validation subsection");

        courseProgress.save();
        return res.status(200).json({
            success: true,
            message:"Update Course Progress Successfully!"
        })
    } catch (error) {
        console.log("updateCourseProgress Error =>", error);
        return res.status(500).json({success:false,message:error.message})
    }
}