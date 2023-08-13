const Tag = require("../models/TagsSchema");

// create tag ka handle function
exports.createTag = async (req, res) => {
    try {
        // fetch data 
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message:"All fiel required",
            })
        }

        // create entery in db
        const tagDetails = await Tag.create({
            name: name,
            description:description
        })
        console.log(tagDetails);

        // return response
        res.status(200).json({
            success: true,
            message:"Tag created successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:error.message
        })
    }
}

// get all tags handler function
exports.showAllTag = async (req, res) => {
    try {
        const allTags = await Tag.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: "All tags return successfully",
            allTags
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:error.message
        })
    }
}