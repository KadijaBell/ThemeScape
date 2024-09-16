const express = require("express");
const { Spot, SpotImage, User, Review, Booking, ReviewImage} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const router = express.Router();


    // GET /reviews/current - Get all reviews by the current authenticated user
    router.get('/current', requireAuth, async (req, res) => {
      const userId = req.user.id;

      try {
        // Find reviews by the current user, including data for User, Spot, and ReviewImage
        const userReviews = await Review.findAll({
          where: { userId },
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName'],
            },
            {
              model: Spot,
              attributes: [
                'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'
              ],
              include: [
                {
                  model: SpotImage,
                  as: 'previewImage',
                  attributes: ['url'],
                  where: { preview: true },
                  required: false // if spot doesn't have a prev image
                }
              ]
            },
            {
              model: ReviewImage,
              attributes: ['id', 'url'],
            },
          ],
        });


        if (!userReviews.length) {
          return res.status(200).json({ Review: [] });
        }

        // Process the reviews and send the response
        return res.status(200).json({
          Review: userReviews.map(review => {
            // Extract the preview image if it exists
            const previewImage = review.Spot.SpotImage && review.Spot.SpotImage[0]
              ? review.Spot.SpotImage[0].url
              : null;

            return {
              id: review.id,
              userId: review.userId,
              spotId: review.spotId,
              review: review.review,
              stars: review.stars,
              createdAt: review.createdAt,
              updatedAt: review.updatedAt,
              User: {
                id: review.User.id,
                firstName: review.User.firstName,
                lastName: review.User.lastName,
              },
              Spot: {
                id: review.Spot.id,
                ownerId: review.Spot.ownerId,
                address: review.Spot.address,
                city: review.Spot.city,
                state: review.Spot.state,
                country: review.Spot.country,
                lat: review.Spot.lat,
                lng: review.Spot.lng,
                name: review.Spot.name,
                price: review.Spot.price,
                previewImage: previewImage, // Set the preview image URL or null
              },
              ReviewImage: review.ReviewImage.map(image => ({
                id: image.id,
                url: image.url,
              })),
            };
          }),
        });
      } catch (error) {
        console.error('Error fetching reviews for the current user:', error);
        return res.status(500).json({
          message: 'Internal server error',
          statusCode: 500,
        });
      }
    });


  // PUT /reviews/:reviewId - Update a review
  router.put('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { review, stars } = req.body;
    const { user } = req;

    try {
      // Fetch the existing review by ID
      const existingReview = await Review.findByPk(reviewId);

      // If review doesn't exist, return a 404 error
      if (!existingReview) {
        return res.status(404).json({
          message: "Review couldn't be found",
          statusCode: 404
        });
      }

      // Check if authenticated user is the owner of the review
      if (existingReview.userId !== user.id) {
        return res.status(403).json({
          message: "Forbidden - You are not authorized to update this review",
          statusCode: 403
        });
      }

      // Validate the `review` and `stars` fields
      if (!review || typeof stars !== 'number' || stars < 1 || stars > 5) {
        return res.status(400).json({
          message: "Validation error",
          statusCode: 400,
          errors: {
            review: review ? null : "Review text is required",
            stars: stars < 1 || stars > 5 ? "Stars must be an integer from 1 to 5" : null
          }
        });
      }

      // Update the review in the database
      existingReview.review = review;
      existingReview.stars = stars;

      await existingReview.save();

      return res.status(200).json({
        id: existingReview.id,
        userId: existingReview.userId,
        spotId: existingReview.spotId,
        review: existingReview.review,
        stars: existingReview.stars,
        createdAt: existingReview.createdAt,
        updatedAt: existingReview.updatedAt
      });
    } catch (err) {
      console.error("Error updating review:", err);
      return res.status(500).json({
        message: "Internal server error",
        statusCode: 500
      });
    }
  });



// constant for the max num of images per review
const maxReviewImages = 10;

// POST /reviews/:id/images - Create new image for a review
router.post('/:id/images', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id;
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      message: 'Validation error: URL is required.',
      statusCode: 400,
    });
  }

  try {
    // if review exists?
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        statusCode: 404,
      });
    }

    // check if the auth user is the owner of review
    if (review.userId !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to add an image to this review',
        statusCode: 403,
      });
    }

    // check if the max num of images for this review has been met
    const reviewImagesCount = await ReviewImage.count({
      where: { reviewId },
    });
    if (reviewImagesCount >= maxReviewImages) {
      return res.status(403).json({
        message: `Maximum number of images (${maxReviewImages}) for this review has been reached`,
        statusCode: 403,
      });
    }
// Create new image
const newImage = await ReviewImage.create({
    reviewId,
    url,
  });

  // Return the data
  return res.status(201).json({
    id: newImage.id,
    url: newImage.url,
  });
} catch (error) {
  console.error('Error creating review image:', error);
  res.status(500).json({
    message: 'Internal server error',
    statusCode: 500,
  });
}
});

//delete a review
router.delete("/:reviewId", requireAuth, async (req, res) => {
  const reviewId = req.params.reviewId;
  const currentUserId = req.user.id;

  try {
    // Find the review by ID
    const review = await Review.findByPk(reviewId);

    // If the review is not found, return 404
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Check if the current user is the owner of the review
    if (review.userId !== currentUserId) {
      return res.status(403).json({ message: "Forbidden - You are not authorized to delete this review" });
    }

    // Delete the review
    await review.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
