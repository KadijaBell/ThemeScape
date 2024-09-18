const express = require("express");
const { Spot, SpotImage, User, Review, Booking, ReviewImage} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");
const { Op } = require("sequelize");
const router = express.Router();

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




//Get current users bookings
router.get("/current", requireAuth, async (req, res, next) => {
  const uid = req.user.id;

  try {
    const bookings = await Booking.findAll({
      where: { userId: uid },
      include: [
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
            "previewImage",
            "price",
          ],

        }]});

    return res.json({ Bookings: bookings });
  } catch (error) {
    next(error);
  }
});


//edit a booking
//   router.put("/:bookingId", requireAuth, validateBooking, async (req, res) => {
//   const bookingId = req.params.bookingId;
//   const { startDate, endDate } = req.body;
//   const userId = req.user.id; // userId from authentication

//   try {
//     // Find the booking by ID
//     const booking = await Booking.findByPk(bookingId);

//     // If booking is not found, return 404
//     if (!booking) {
//       return res.status(404).json({ message: "Booking couldn't be found" });
//     }

//     // Check if the current user owns this booking
//     if (booking.userId !== userId) {
//       return res
//         .status(403)
//         .json({ message: "You do not have permission to edit this booking" });
//     }

//     if (new Date(endDate) <= new Date(startDate)) {
//       return res.status(400).json({
//         message: "Bad Request",
//         errors: { endDate: "End date cannot be on or before startDate" },
//       });
//     }
// } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//     }
//     });


//edit a booking
router.put("/:bookingId", requireAuth, async (req, res, next) => {
  const userId = req.user.id;
  const bookingId = req.params.bookingId;
  const { startDate, endDate } = req.body;

  try {
    // Find the booking by its ID
    const booking = await Booking.findByPk(bookingId);

    // If booking doesn't exist, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the booking belongs to the current user
    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: Booking doesn't belong to the user" });
    }

    // Prevent updates if the booking has already started
    const currentDate = new Date();
    if (currentDate >= new Date(booking.startDate)) {
      return res
        .status(403)
        .json({ message: "Bookings that have started can't be updated" });
    }

    // Check if endDate is before startDate
    if (new Date(endDate) <= new Date(startDate)) {
      return res
        .status(400)
        .json({ message: "End date cannot be before the start date" });
    }

    // Check for booking conflicts with other bookings
    const conflictingBookings = await Booking.findAll({
      where: {
        spotId: booking.spotId,
        id: { [Op.ne]: bookingId }, // Exclude the current booking
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
        ],
      },
    });

    // If there are conflicts, return 403
    if (conflictingBookings.length > 0) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    // Update the booking with the new dates
    await booking.update({ startDate, endDate });
    await booking.save();
    // Return the updated booking with a 200 status
    return res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
});


//     // Get all bookings for the same spot
//     router.put("/:bookingId", requireAuth, validateBooking,
//       async (req, res) => {
//         const bookingId = req.params.bookingId;
//         const { startDate, endDate } = req.body;
//         const userId = req.user.id;

//         try {
//           // Find the booking by ID
//           const booking = await Booking.findByPk(bookingId);

//           // If booking is not found, return 404
//           if (!booking) {
//             return res
//               .status(404)
//               .json({ message: "Booking couldn't be found" });
//           }

//           // Check if the current user owns this booking
//           if (booking.userId !== userId) {
//             return res
//               .status(403)
//               .json({
//                 message: "You do not have permission to edit this booking",
//               });
//           }

//           // Get all bookings for the same spot
//           const existingBookings = await Booking.findAll({
//             where: { spotId: booking.spotId },
//           });

//           // Check for conflicting bookings manually
//           for (const existingBooking of existingBookings) {
//             // Skip the current booking being updated
//             if (existingBooking.id === bookingId) continue;

//             const existingStartDate = new Date(existingBooking.startDate);
//             const existingEndDate = new Date(existingBooking.endDate);

//             // Conflict Scenario 1: Existing booking starts within the new booking dates
//             if (
//               existingStartDate >= new Date(startDate) &&
//               existingStartDate <= new Date(endDate)
//             ) {
//               return res.status(403).json({
//                 message:
//                   "Sorry, this spot is already booked for the specified dates",
//                 errors: {
//                   startDate: "Start date conflicts with an existing booking",
//                   endDate: "End date conflicts with an existing booking",
//                 },
//               });
//             }

//             // Conflict Scenario 2: Existing booking ends within the new booking dates
//             if (
//               existingEndDate >= new Date(startDate) &&
//               existingEndDate <= new Date(endDate)
//             ) {
//               return res.status(403).json({
//                 message:
//                   "Sorry, this spot is already booked for the specified dates",
//                 errors: {
//                   startDate: "Start date conflicts with an existing booking",
//                   endDate: "End date conflicts with an existing booking",
//                 },
//               });
//             }

//             // Conflict Scenario 3: Existing booking fully overlaps with the new booking
//             if (existingStartDate <= new Date(startDate) && existingEndDate >= new Date(endDate)){
//               return res.status(403).json({
//                 message:
//                   "Sorry, this spot is already booked for the specified dates",
//                 errors: {
//                   startDate: "Start date conflicts with an existing booking",
//                   endDate: "End date conflicts with an existing booking",
//                 },
//               });
//             }
//           }

//           // No conflicts: Update the booking
//           booking.startDate = startDate;
//           booking.endDate = endDate;
//           await booking.save();

//           // Send the updated booking
//           res.status(200).json({
//             id: booking.id,
//             spotId: booking.spotId,
//             userId: booking.userId,
//             startDate: booking.startDate,
//             endDate: booking.endDate,
//             createdAt: booking.createdAt,
//             updatedAt: booking.updatedAt,
//           });
//         } catch (error) {
//           console.error(error);
//           return res.status(500).json({ message: "Internal server error" });
//         }

//     );

//     // If no conflicts, update the booking
//     booking.startDate = startDate;
//     booking.endDate = endDate;
//     await booking.save();

//     // Send the updated booking
//     res.status(200).json({
//       id: booking.id,
//       spotId: booking.spotId,
//       userId: booking.userId,
//       startDate: booking.startDate,
//       endDate: booking.endDate,
//       createdAt: booking.createdAt,
//       updatedAt: booking.updatedAt,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });
// delete a booking
router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: {
        model: Spot,
        attributes: ["ownerId"],
      },
    });

    // If booking not found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // If the booking doesn't belong to the user or spot owner, return 403
    if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const today = new Date();

    // If the booking has already started, return 403
    if (new Date(booking.startDate) <= today) {
      return res.status(403).json({
        message: "Bookings that have been started can't be deleted",
      });
    }

    // Delete the booking and return success message with status 200
    await booking.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "Did not delete booking",
      error: err.message,
    });
  }
});


module.exports = router;
