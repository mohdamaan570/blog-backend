const articleModel = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const { uploadImagesViaImageKit } = require('../utils/imageKit');

module.exports.createArticle = catchAsyncError(async (req, res, next) => {
    let { title, description, category } = JSON.parse(JSON.stringify(req.body));
    let ImageArray = req.files;
    let url = [];

    /* Checking image size. Don't allow if size is greater than 1 MB of each image.*/
    for (let i in ImageArray) {
        if (ImageArray[i].size > 1000000) {
            return next(new ErrorHandler(413, "Image size is greater than 1 MB."));
        }
    }

    /* Uploading each image to imageKit.io*/
    for (let i in ImageArray) {
        url[i] = await uploadImagesViaImageKit(ImageArray[i].buffer, ImageArray[i].originalname);
    }

    /* Creating new document.*/
    let article = await articleModel.create({
        title,
        description,
        category,
        articleImage: url,
        createdBy: req.user.id,
    });
    if (!article) {
        return next(new ErrorHandler(302, "Article cannot created!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
});

module.exports.getSingleArticle = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.findById(req.params.articleId);
    if (!article) {
        return next(new ErrorHandler(404, "Article not available!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

module.exports.getArticles = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.find();
    if (!article.length) {
        return next(new ErrorHandler(404, "Article not available!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

// module.exports.searchQueryArticles = catchAsyncError(async (req, res, next) => {
//     let { title } = req.params;
//     if (title === "all") {
//         // Redirect to the getArticles handler
//         return exports.getArticles(req, res, next);
//     }
//     // console.log('get articles conditionally');
//     let article = await articleModel.find({ title: { $regex: `^${title}`, $options: "i" } });
//     if (!article.length) {
//         return next(new ErrorHandler(404, "Article not available!"));
//     }
//     res.status(200).json({
//         success: true,
//         article,
//     })
// })

module.exports.filterArticles = catchAsyncError(async (req, res, next) => {
    const { data } = req.body;
    // console.log(typeof data === 'string');
    let article = undefined;
    if (typeof data === 'string') {
        article = await articleModel.find({ title: { $regex: `^${data}`, $options: "i" } });
    } else {
        const { food, travel, politics, technology } = data;
        const categoryForFilter = {
            Food: food,
            Travel: travel,
            Politics: politics,
            Technology: technology,
        };

        const filteredCategory = {
            $or: Object.keys(categoryForFilter).filter(key => categoryForFilter[key] !== null).map(key => ({ category: key })),
        }
        // console.log(filteredCategory);
        article = await articleModel.find(filteredCategory);
    }

    if (!article.length) {
        return next(new ErrorHandler(404, "Article not available!"));
    }

    res.status(200).json({
        success: true,
        article,
    });

})

module.exports.updateArticle = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) {
        return next(new ErrorHandler(302, "Article cannot update!"));
    }
    res.status(200).json({
        success: true,
        message: "item update successfully",
    })
})

module.exports.deleteArticle = catchAsyncError(async (req, res, next) => {
    let articleDelete = await articleModel.findByIdAndRemove(req.params.id);
    if (!articleDelete) {
        return next(new ErrorHandler(302, `Resources not found!`));
    }
    res.status(200).json({
        success: true,
        message: "item delete successfully",
    })
})