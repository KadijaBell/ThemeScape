const express = require("express");
const { SpotImage, Spot } = require("../../db/models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

// delete a spot image
router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user.id;

  try {
    // Find the image
    const image = await SpotImage.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }
    // Check if the current user is the owner of the spot
    if (image.spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Delete the image
    await image.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
})

module.exports = router;
