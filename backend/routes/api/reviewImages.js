const express = require("express");
const { Spot, SpotImage, User, Review, Booking, ReviewImage} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const router = express.Router({ mergeParams: true });


// Add an image to a review based on the review's id
// /api/reviews/:reviewId/images
router.post("/", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "Validation error",
      errors: {
        url: "Url is required",
      },
    });
  }

  try {
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    // send 404 if review doesn't exist
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    //   check if review belongs to user
    if (existingReview.userId !== uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    // check if maxed images - max of 10
    if (existingReview.Images.length >= 10) {
      const err = new Error(
        "Maximum number of images for this resource was reached"
      );
      err.status = 403;
      return next(err);
    }

    const newImage = await ReviewImage.create({
      url,
      reviewId,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    next(error);
  }
});

// delete a review image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    // get the image id
    const imageId = req.params.imageId;
    // get the user id
    const userId = req.user.id
    try {

        // get the image
        const image = await ReviewImage.findByPk(imageId, {
          include: {
            model: Review,
            attributes: ["userId"],
          },
        });
        // if the image does not exist
        if (!image) {
            return res.status(404).json({ message: "Review Image couldn't be found" });
        }

        // if the image belongs to the user
        if (image.Review.userId !== userId) {
            return res.status(403).json({ message: "Forbidden: You do not own this review"  });
        }

        // delete the image
        await image.destroy();
        return res.status(200).json({ message: "Successfully deleted" });

    } catch (error) {
        next(error);
    }
})

// // Set a constant for the maximum number of images per review
// const MAX_REVIEW_IMAGES = 10;

// // POST /reviews/:id/images - Create a new image for a review
// router.post('/:id/images', requireAuth, async (req, res) => {
//   const userId = req.user.id; // Assuming `req.user.id` is set after authentication
//   const reviewId = req.params.id;
//   const { url } = req.body;

//   if (!url || typeof url !== 'string') {
//     return res.status(400).json({
//       message: 'Validation error: URL is required.',
//       statusCode: 400,
//     });
//   }

//   try {
//     // Check if the review exists
//     const review = await Review.findByPk(reviewId);
//     if (!review) {
//       return res.status(404).json({
//         message: 'Review not found',
//         statusCode: 404,
//       });
//     }

//     // Check if the authenticated user is the owner of the review
//     if (review.userId !== userId) {
//       return res.status(403).json({
//         message: 'You are not authorized to add an image to this review',
//         statusCode: 403,
//       });
//     }

//     // Check if the maximum number of images for this review has been reached
//     const reviewImagesCount = await ReviewImage.count({
//       where: { reviewId },
//     });
//     if (reviewImagesCount >= MAX_REVIEW_IMAGES) {
//       return res.status(403).json({
//         message: `Maximum number of images (${MAX_REVIEW_IMAGES}) for this review has been reached`,
//         statusCode: 403,
//       });
//     }

//     // Create the new image
//     const newImage = await ReviewImage.create({
//       reviewId,
//       url,
//     });

//     // Return the newly created image data
//     return res.status(201).json({
//       id: newImage.id,
//       url: newImage.url,
//     });
//   } catch (error) {
//     console.error('Error creating review image:', error);
//     res.status(500).json({
//       message: 'Internal server error',
//       statusCode: 500,
//     });
//   }
// });

module.exports = router;
