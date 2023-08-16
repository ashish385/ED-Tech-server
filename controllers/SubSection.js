const SubSection = require('../models/SubSectionSchema');
const Section = require('../models/SubSectionSchema');
const { fileUploadToCloudinary } = require('../utils/fileUploader');


// create sub section
exports.createSubSection = async (req, res) => {
    try {
        // fetch data
        const { sectionId, title, timeDuration, description } = req.body;
        
        // extract file
        const video = req.files.videoFile;
        // validate
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.json({
                success: false,
                message:"All fields required!"
            })
        }

        // upload video to cloudinary
        const uploadDetails = await fileUploadToCloudinary(video, process.env.FOLDER_NAME);

        // create subsection
        const subSectionDetails = await SubSection.create({
            title: title, timeDuration: timeDuration, description: description,
            videoUrl: uploadDetails.secure_url
        });
        // update section with this subSection obejctId
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId }, {
            $push: {
                subSection: subSectionDetails._id,
            }
        }, {
            new: true
        });

        // HW: log updated section here, after adding populate query
        // return res
        return res.status(200).json({
            success: true,
            message: "Sub Section created successfully!",
            updatedSection,
        })
        
    } catch (error) {
       console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to create SubSection,Please try again!",
          error:error.message
      }) 
    }
}

// update sub section
exports.updateSubSection = async (req, res) => {
    try {
        // fetch data
        const { subSectionId, title, timeDuration, description } = req.body;
        
        // extract file
        const video = req.files.videoFile;

        // update file on cloudinary
        const uploadFile = await fileUploadToCloudinary(video, process.env.FOLDER_NAME);
        // validate
        if (!subSectionId || !title || !timeDuration || !description || !video) {
            return res.json({
                success: false,
                message:"All fields required!"
            })
        }
        // update susection
        const subSection = await SubSection.findByIdAndUpdate({ _id: subSectionId }, {
            title: title,
            timeDuration: timeDuration,
            description: description,
            video:uploadFile.secure_url
        })

        // return response
        return res.status(200).json({
          success: true,
          message: "Sub Section updated Successfully!",
          updateCourseDetails
      })
        
    } catch (error) {
         console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to update SubSection,Please try again!",
          error:error.message
      }) 
    }
}

// delete sub section
exports.deleteSubSection = async (req, res) => {
    try {
        // fetch id
        const { subSectionId } = req.params;
        // validate
        // delete sub section
        await SubSection.findByIdAndDelete(subSectionId);
        //  // TODO[Testing-Time]: do we need to delete the entry from the section and course Schema??

        // return res
        return res.status(200).json({
          success: true,
          message: "Sub Section deleted Successfully!",
        
      })
    } catch (error) {
         console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to delete SubSection,Please try again!",
          error:error.message
      }) 
    }
}