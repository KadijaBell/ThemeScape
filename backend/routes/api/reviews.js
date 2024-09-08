const express = require("express");
const { Review } = require("../../db/models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");



router.delete("/:reviewId", requireAuth, async (req, res) => {
    // getting the review by id
    const reviewId = req.params.reviewId;

    // getting the users id
    const userId = req.user.id;

    try {
        // getting the review exists
        const review = await Review.findByPk(reviewId);

        // if the review does not exist
        if (!review) {
            return res.status(404).json({ message: "Review couldn't be found" });
        }

        // if the review belongs to the user
        // since the review has the id of the user who made it
        // we can compare it with the user id since thats the id of the user
        // making the request
        if (review.userId !== userId) {
             return res.status(403).json({message: "You do not have permission to edit this review",});
        }

        // deleting the review
        await review.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
    }
});
