const SubSection = require('../models/SubSectionSchema');
const Section = require('../models/SubSectionSchema');


// create sub section
exports.createSubSection = async (req, res) => {
    try {
        // fetch data
        // validate
        // create subsection
        
    } catch (error) {
       console.log(error);
      return res.status(500).json({
          success: false,
          message: "Unable to delete section,Please try again!",
          error:error.message
      }) 
    }
}