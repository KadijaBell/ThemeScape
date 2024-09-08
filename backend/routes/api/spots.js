const express = require("express");
const { Spots } = require("../../db/models/spots");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");

const authenticationMiddleware = (req, res, next) => {
  if (!req.user) {
    // Assuming req.user is set by some authentication process
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

router.get("/", async (req, res) => {
  try {
    const spots = await Spots.findAll();
    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: "Server error", errors: err.errors });
  }
});

router.post("/", authenticationMiddleware, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  try {
    const newSpot = await Spots.create({
      ownerId: req.user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    res.status(201).json(newSpot);
  } catch (err) {
    res.status(400).json({ message: "Bad Request", errors: err.errors });
  }
});

// create a booking from a spot based on the spots id
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  // get the spot id
  const spotId = req.params.spotId;
  // get the start and end dates for the booking from the req.body
  const { startDate, endDate } = req.body;
  // get the user id
  const userId = req.user.id;

  try {
    // get the spot
    const spot = await Spots.findByPk(spotId);

    // if the spot does not exist
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // if spot belongs to the user
    if (spot.ownerId === userId) {
      return res.status(403).json({ message: "Can't book your own spot" });
    }

    // check if startDate is in the past
    const currentDate = new Date();
    if (new Date(startDate) < currentDate) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          startDate: "startDate cannot be in the past",
        },
      });
    }

    // check if endDate is before or on the same day as startDate
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          endDate: "endDate cannot be on or before startDate",
        },
      });
    }

    // fetch all bookings for this spot
    const bookings = await Booking.findAll({ where: { spotId } });

    // manually check for booking conflicts
    for (const booking of bookings) {
      const existingStartDate = new Date(booking.startDate);
      const existingEndDate = new Date(booking.endDate);

      // Check if the new booking overlaps with existing bookings
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      // Check for conflicts
      if (
        (newStart >= existingStartDate && newStart <= existingEndDate) || // new start overlaps existing
        (newEnd >= existingStartDate && newEnd <= existingEndDate) || // new end overlaps existing
        (newStart <= existingStartDate && newEnd >= existingEndDate) // new booking fully overlaps existing
      ) {
        return res.status(403).json({
          message: "Sorry, this spot is already booked for the specified dates",
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking",
          },
        });
      }
    }

    // create the booking
    const newBooking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    // successful response
    return res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
