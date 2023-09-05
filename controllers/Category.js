const Category = require("../models/Category");

// create category ka handle function
exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
            message: "Categorys Created Successfully",
            categoryPageDetails:categoryPageDetails,
		});
    } catch (error) {
        console.log(error);
        console.log("err",error.message);
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};
// get all categories handler function
exports.showAllCategories = async (req, res) => {
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

// category page details
exports.categoryPageDetails = async (req, res) => {
    try {
        // get Category id
        const { categoryId } = req.body;

        // get courses for specified catogeryId
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        // validation
        if (!selectedCategory) {
            return res.status(400).json({
                success: false,
                message:"Category Not found"
            })
        }
        // get course for different categories
        const diffrentCategories = await Category.findById({ _id: { $ne: categoryId } }).populate("courses").exec();
        // get top selling courses
        // HW
        // return response
        return res.status(200).json({
                success: true,
            message: "Category  found",
            data: {
                selectedCategory,
                diffrentCategories
                }
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
                success: false,
                message:error.message
            })
        
    }
}