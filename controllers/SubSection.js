const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { fileUploadToCloudinary } = require('../utils/fileUploader');
// const { find } = require('../models/Course');


// create sub section
exports.createSubSection = async (req, res) => {
    try {
      // Extract necessary information from the request body
      const { sectionId, title, description } = req.body
      const video = req.files.video
      console.log(req.body,"+",video,"file",req.files);
  
      // Check if all necessary fields are provided
      if (!sectionId || !title || !description || !video) {
        return res
          .status(404)
          .json({ success: false, message: "All Fields are Required!" })
      }
      console.log(video)
  
      // Upload the video file to Cloudinary
      const uploadDetails = await fileUploadToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      console.log("video-url",uploadDetails.secure_url)
      // Create a new sub-section with the necessary information
      const SubSectionDetails = await SubSection.create({
        title: title,
        timeDuration: `${uploadDetails.duration}`,
        description: description,
        videoUrl: uploadDetails.secure_url,
      })
  
      // Update the corresponding section with the newly created sub-section
      const updatedSection = await Section.findByIdAndUpdate(
        { _id: sectionId },
        { $push: { subSection: SubSectionDetails._id } },
        { new: true }
      ).populate("subSection");

      const newSection = await Section.findById({ _id: sectionId }).populate({
        path: "subSection",
      });

      console.log("updatedSection", newSection);
  
      // Return the updated section in the response
      return res
        .status(200)
        .json({
          success: true,
          data: newSection,
          videoUrl: uploadDetails.secure_url,
        });
    } catch (error) {
      // Handle any errors that may occur during the process
      console.error("Error creating new sub-section:", error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
}
  

// update sub section
 exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await fileUploadToCloudinary(
          video,
          process.env.FOLDER_NAME
        );
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()

      const updateSection = await Section.findById(sectionId).populate(
        "subSection"
      );
  
      return res.json({
        success: true,
        data:updateSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }

// delete sub section
exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updateSection = await Section.findById(sectionId).populate(
        "subSection"
      );
  
      return res.json({
        success: true,
        data:updateSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }