const express = require("express");
const { Booking, Spot } = require("../../models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

const validateBooking = [
  // Check if startDate exists
  check("startDate")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required"),

  // Check if endDate exists
  check("endDate")
    .exists({ checkFalsy: true })
    .withMessage("End date is required"),

  // Custom validation to check if startDate is before endDate
  check("startDate").custom((value, { req }) => {
    const startDate = new Date(value);
    const endDate = new Date(req.body.endDate);

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // If the validation passes, return true
    return true;
  }),
  handleValidationErrors,
];

//edit a booking
router.put("/:bookingId", requireAuth, validateBooking, async (req, res) => {
  const bookingId = req.params.bookingId;
  const { startDate, endDate } = req.body;
  const userId = req.user.id; // userId from authentication

  try {
    // Find the booking by ID
    const booking = await Booking.findByPk(bookingId);

    // If booking is not found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the current user owns this booking
    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this booking" });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { endDate: "End date cannot be on or before startDate" },
      });
    }

    // Get all bookings for the same spot
    router.put(
      "/:bookingId",
      requireAuth,
      validateBooking,
      async (req, res) => {
        const bookingId = req.params.bookingId;
        const { startDate, endDate } = req.body;
        const userId = req.user.id;

        try {
          // Find the booking by ID
          const booking = await Booking.findByPk(bookingId);

          // If booking is not found, return 404
          if (!booking) {
            return res
              .status(404)
              .json({ message: "Booking couldn't be found" });
          }

          // Check if the current user owns this booking
          if (booking.userId !== userId) {
            return res
              .status(403)
              .json({
                message: "You do not have permission to edit this booking",
              });
          }

          // Get all bookings for the same spot
          const existingBookings = await Booking.findAll({
            where: { spotId: booking.spotId },
          });

          // Check for conflicting bookings manually
          for (const existingBooking of existingBookings) {
            // Skip the current booking being updated
            if (existingBooking.id === bookingId) continue;

            const existingStartDate = new Date(existingBooking.startDate);
            const existingEndDate = new Date(existingBooking.endDate);

            // Conflict Scenario 1: Existing booking starts within the new booking dates
            if (
              existingStartDate >= new Date(startDate) &&
              existingStartDate <= new Date(endDate)
            ) {
              return res.status(403).json({
                message:
                  "Sorry, this spot is already booked for the specified dates",
                errors: {
                  startDate: "Start date conflicts with an existing booking",
                  endDate: "End date conflicts with an existing booking",
                },
              });
            }

            // Conflict Scenario 2: Existing booking ends within the new booking dates
            if (
              existingEndDate >= new Date(startDate) &&
              existingEndDate <= new Date(endDate)
            ) {
              return res.status(403).json({
                message:
                  "Sorry, this spot is already booked for the specified dates",
                errors: {
                  startDate: "Start date conflicts with an existing booking",
                  endDate: "End date conflicts with an existing booking",
                },
              });
            }

            // Conflict Scenario 3: Existing booking fully overlaps with the new booking
            if (
              existingStartDate <= new Date(startDate) &&
              existingEndDate >= new Date(endDate)
            ) {
              return res.status(403).json({
                message:
                  "Sorry, this spot is already booked for the specified dates",
                errors: {
                  startDate: "Start date conflicts with an existing booking",
                  endDate: "End date conflicts with an existing booking",
                },
              });
            }
          }

          // No conflicts: Update the booking
          booking.startDate = startDate;
          booking.endDate = endDate;
          await booking.save();

          // Send the updated booking
          res.status(200).json({
            id: booking.id,
            spotId: booking.spotId,
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    );

    // If no conflicts, update the booking
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    // Send the updated booking
    res.status(200).json({
      id: booking.id,
      spotId: booking.spotId,
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// delete a booking
router.delete("/bookings/:bookingId", requireAuth, async (req, res) => {
  const bookingId = req.params.bookingId; // Corrected from req.params.id
  const currentUserId = req.user.id; // Assuming you have current user info in req.user

  try {
    // Find the booking by ID
    const booking = await Booking.findByPk(bookingId, {
      include: {
        model: Spot,
        attributes: ["ownerId"],
      },
    });

    // If the booking is not found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the booking has started (you'll need to determine what field indicates this)
    const currentDate = new Date();
    if (currentDate >= booking.startDate) {
      return res
        .status(403)
        .json({ message: "Bookings that have been started can't be deleted" });
    }

    // Check if the booking belongs to the current user or if the spot owner is the current user
    if (
      booking.userId !== currentUserId &&
      booking.Spot.ownerId !== currentUserId
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this booking" });
    }

    // Destroy the booking
    await booking.destroy();

    // Send success response
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get all bookings for a spot based on spot id
router.get("/spots/:spotId/bookings", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const currentUserId = req.user.id; //req.user contains the authenticated user info

  try {
    // Find the spot first to check ownership
    const spot = await Spot.findByPk(spotId);

    // If the spot is not found, return a 404 error
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Determine if the current user is the owner of the spot
    const isOwner = spot.ownerId === currentUserId;

    // Set up the include for the Booking model
    let include = [
      {
        model: Booking,
        attributes: ["spotId","startDate", "endDate"],
      },
    ];

    // If the user is the owner, add the User model to the include
    if (isOwner) {
      include = [
        {
          model: Booking,
          include: [
            { model: User, attributes: ["id", "firstName", "lastName"] },
          ],
          attributes: [
            "id",
            "spotId",
            "userId",
            "startDate",
            "endDate",
            "createdAt",
            "updatedAt",
          ],
        },
      ];
    }

    // Now, find the spot again with the proper include (based on ownership)
    const spotWithBookings = await Spot.findByPk(spotId, { include });

    // Map through the bookings and customize the response based on ownership
    const bookings = spotWithBookings.Bookings.map((booking) => {
      if (isOwner) {
        // Detailed booking info with user data for the owner
        return {
          User: {
            id: booking.User.id,
            firstName: booking.User.firstName,
            lastName: booking.User.lastName,
          },
          id: booking.id,
          spotId: booking.spotId,
          userId: booking.userId,
          startDate: booking.startDate,
          endDate: booking.endDate,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };
      } else {
        // Basic booking info for non-owners
        return {
          spotId: booking.spotId,
          startDate: booking.startDate,
          endDate: booking.endDate,
        };
      }
    });

    // Return the bookings in the correct format
    return res.status(200).json({ Bookings: bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// gat all of the current user's bookings
router.get("/current", requireAuth, async (req, res) => {
  const currentUserId = req.user.id;
  try {
    const bookings = await Booking.findAll({
      where: { userId: currentUserId },
      include: {
        model: Spot, // Include the Spot model to get spot details
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
    });
    return res.status(200).json({ Bookings: bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
})


module.exports = router;
