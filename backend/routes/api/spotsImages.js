const express = require("express");
const { Spot, SpotImage, User, Review, Booking, ReviewImage} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");
const router = express.Router();

// delete a spot image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
  const imageId = req.params;
  const userId = req.user.id;

  try {
    // Find the image
    const image = await SpotImage.findByPk(imageId, {
      include: {
        model: Spot,
        attributes: ["ownerId"],
      },
    });
    if (!image) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }
    // Check if the current user is the owner of the spot
    if (image.spot.ownerId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this spot" });
    }
    // Delete the image
    await image.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error)
  }
})

module.exports = router;
