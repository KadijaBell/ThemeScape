const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Spot, SpotImage, User, Review, Booking, ReviewImage} = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const router = express.Router();

// Check validation for reviews
const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

// Get the reviews of the current user
// /api/reviews/current ~ not /api/reviews/:userId
router.get("/current", requireAuth, async (req, res, next) => {
  const uid = req.user.id;
  try {
    const currentUserReviews = await Review.findAll({
      where: { userId: uid },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Spot,
          attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
            "previewImage",
          ],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });
    res.json(currentUserReviews);
  } catch (error) {
    next(error);
  }
});


// POST /reviews/:id/images - Create new image for a review
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const userId = req.user.id;
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
    // if review exists?
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });
    if (!existingReview) {
      return res.status(404).json({
        message: "Review couldn't be found"
      });
    }

    // check if the auth user is the owner of review
    if (existingReview.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    // check if the max num of images for this review has been met
    const reviewImages = await ReviewImage.findAll({
      where: { reviewId },
    });

    if (reviewImages.length >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }
// Create new image
const newImage = await ReviewImage.create({
    url,
    reviewId,
  });

  // Return the data
  return res.status(201).json({
    id: newImage.id,
    url: newImage.url,
  });
} catch (error) {
 next(error);
}});

  // PUT /reviews/:reviewId - Update a review
  router.put('/:reviewId', requireAuth, validateReview, async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const uid = req.user.id;
    const { review, stars } = req.body;

    try {
      // Fetch the existing review by ID
      const existingReview = await Review.findByPk(reviewId);

      // If review doesn't exist, return a 404 error
      if (!existingReview) {
        return res.status(404).json({
          message: "Review couldn't be found"});
      }

      // Check if authenticated user is the owner of the review
      if (existingReview.userId !== uid) {
        return res.status(403).json({message: "Forbidden"});
      }


      await existingReview.update({ review, stars });
      await existingReview.save();

      res.status(200).json(existingReview);
    } catch (error) {
      next(error);
    }
  }
);




//delete a review
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const currentUserId = req.user.id;

  try {
    // Find the review by ID
    const existingReview = await Review.findByPk(reviewId);

    // If the review is not found, return 404
    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Check if the current user is the owner of the review
    if (existingReview.userId !== currentUserId) {
      return res.status(403).json({ message: "Forbidden - You are not authorized to delete this review" });
    }

    // Delete the review
    await existingReview.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
