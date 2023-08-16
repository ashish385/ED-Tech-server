const Category = require("../models/CategorySchema");

// create tag ka handle function
exports.createCategory = async (req, res) => {
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
        const tagDetails = await Category.create({
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

// get all categories handler function
exports.showAllCategory = async (req, res) => {
    try {
        const allCategory = await Category.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: "All categories return successfully",
            allCategory
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:error.message
        })
    }
}