const express = require("express");
const { ReviewImage } = require("../../db/models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

// delete a review image
router.delete("/:imageId", requireAuth, async (req, res) => {
    // get the image id
    const imageId = req.params.imageId;
    // get the user id
    const userId = req.user.id
    try {

        // get the image
        const image = await ReviewImage.findByPk(imageId);
        // if the image does not exist
        if (!image) {
            return res.status(404).json({ message: "Review Image couldn't be found" });
        }

        // if the image belongs to the user
        if (image.userId !== userId) {
            return res.status(403).json({ message: "You do not have permission to delete this image" });
        }

        // delete the image
        await image.destroy();
        return res.status(200).json({ message: "Successfully deleted" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
