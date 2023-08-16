const Section = require("../models/SectionSchema");
const Course = require("../models/CourseSchema");

exports.createSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, courseId } = req.body;

    // validate data
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties!",
      });
    }
    // create section
    const newSection = await Section.create({ sectionName });
    // update course with section ObectId
    const updateCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      {
        new: true,
      }
      );
      
    //   Hw:use populate to replace section/subsection both in the updateCourseDetails

    // return response
      return res.status(200).json({
          success: true,
          message: "Section created Successfully!",
          updateCourseDetails
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to create section,Please try again!",
          error:error.message
      })
  }
};

// update section
exports.updateSection = async (req, res) => {
    try {
        //   fetch data
        const { sectionName, sectionId } = req.body;

        // validate
        if (!sectionName || !sectionId) {
            return res.status(400).json({
        success: false,
        message: "Missing Properties!",
      });
        }
        // update section,
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName: sectionName }, { new: true });

        // return response
        return res.status(200).json({
          success: true,
          message: "Section updated Successfully!",
          updateCourseDetails
      })
        
    } catch (error) {
        console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to update section,Please try again!",
          error:error.message
      })
    }
}

// delete section
exports.deleteSection = async (req, res) => {
    try {
        // fetch sectionId -> assuming that we are sending ID in params
        const { sectionId } = req.params;

        // use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        // TODO[Testing-Time]: do we need to delete the entry from the course Schema??

        // return res
        return res.status(200).json({
          success: true,
          message: "Section deleted Successfully!",
    
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to delete section,Please try again!",
          error:error.message
      })
    } 
}