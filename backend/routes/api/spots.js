const express = require('express');
const { Spot, SpotImage, User, Review, Booking, ReviewImage} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check} = require('express-validator');
const router = express.Router();
const bookingsRouter = require("./bookings");
const reviewsRouter = require("./reviews");
const { Op } = require('sequelize');
const { handleValidationErrors } = require("../../utils/validation");

// validate spot body
const validateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"), // 400
  check("city").exists({ checkFalsy: true }).withMessage("City is required"), // 400
  check("state").exists({ checkFalsy: true }).withMessage("State is required"), // 400
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"), // 400
  check("lat")
    .exists({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude is not valid"),
  check("lng")
    .exists({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude is not valid"),
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage("Price per day is required"),
  handleValidationErrors,
];

// check validation for reviews
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

// CRUD Routes to manage Spots, SpotImages, Reviews, Bookings

router.use("/:spotId/bookings", bookingsRouter);
router.use("/:spotId/reviews", reviewsRouter);

// Get all Spots
// /api/spots
router.get("/", async (req, res) => {
  let {
    page = 1,
    size = 20,
    maxLat,
    minLat,
    maxLng,
    minLng,
    minPrice,
    maxPrice,
  } = req.query;

  const errors = {};

  // Convert to numbers for validation
  page = Number(page);
  size = Number(size);
  minLat = Number(minLat);
  maxLat = Number(maxLat);
  minLng = Number(minLng);
  maxLng = Number(maxLng);
  minPrice = Number(minPrice);
  maxPrice = Number(maxPrice);

  // Validate 'page' and 'size'
  if (page < 1) {
    errors.page = "Page must be greater than or equal to 1";
  }
  if (size < 1) {
    errors.size = "Size must be greater than or equal to 1";
  }

  // Validate latitude and longitude
  if (minLat && (minLat < -90 || minLat > 90)) {
    errors.minLat = "Minimum latitude is invalid";
  }
  if (maxLat && (maxLat < -90 || maxLat > 90)) {
    errors.maxLat = "Maximum latitude is invalid";
  }
  if (minLng && (minLng < -180 || minLng > 180)) {
    errors.minLng = "Minimum longitude is invalid";
  }
  if (maxLng && (maxLng < -180 || maxLng > 180)) {
    errors.maxLng = "Maximum longitude is invalid";
  }

  // Validate prices
  if (minPrice && minPrice < 0) {
    errors.minPrice = "Minimum price must be greater than or equal to 0";
  }
  if (maxPrice && maxPrice < 0) {
    errors.maxPrice = "Maximum price must be greater than or equal to 0";
  }

  // If there are errors, return 400 Bad Request with error details
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors,
    });
  }

  const spots = await Spot.findAll({
    include: [
      {
        model: Review,
        attributes: ["stars"]
      },
      {
        model: SpotImage,
        attributes: ["url", "preview"]
      }
    ],
    attributes: ["id","name", "description", "price"],

  });

  let spotsList = spots.map((spot) => spot.toJSON());

  // Process each spot to include avgRating and previewImage
  spotsList.forEach((spot) => {

    let totalStars = 0;
    let reviewCount = 0;

    if (spot.Reviews && spot.Reviews.length > 0) {
      spot.Reviews.forEach((review) => {
        totalStars += review.stars;
        reviewCount++;
      });

      if (reviewCount > 0) {
        spot.avgRating = parseFloat((totalStars / reviewCount).toFixed(1));
      } else {
        spot.avgRating = null;
      }
    } else {
      spot.avgRating = null; // Handle case where there are no reviews
    }

    // Remove Reviews after processing avgRating to clean up the output
    delete spot.Reviews;

    // Handle previewImage
    spot.SpotImage.forEach((image) => {
      if (image.preview === true) {
        spot.previewImage = image.url;
      }
    });

    if (!spot.previewImage) {
      spot.previewImage = "No preview image available";
    }
  });

  // Return the processed list of spots
  res.json({ spots: spotsList });
});
// get all spots owned by the current user

router.get("/current", requireAuth, async (req, res, next) => {
  // get current user from restoreUser middleware

  const userId = req.user.id;

  try {
    const currentUserSpots = await Spot.findAll({
      where: { ownerId: userId },
    });

    res.json(currentUserSpots);
  } catch (error) {
    next(error);
  }
});

// get details of a Spot from an id
router.get("/:spotId", async (req, res, next) => {
  const spotId = req.params.spotId;
  let avgStarRating;
  const numReviews = await Review.count({
    where: { spotId },
  });

  const reviews = await Review.findAll({
    where: { spotId },
    attributes: ["stars"],
  });

  if (reviews.length > 0) {
    const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
    avgStarRating = totalStars / numReviews;
  } else {
    // Handle case where there are no reviews
    avgStarRating = 0;
  }

  try {
    const preSpot = await Spot.findByPk(spotId, {
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
        "description",
        "price",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"], // only has id, firstName, lastName
          as: "Owner",
        },
        {
          model: SpotImage,
          attributes: ["id", "url", "preview"],
          as: "SpotImage",
        },
      ],
    });

    if (!preSpot) {
      //spot not found
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }
    const spotResult = {
      id: preSpot.id,
      ownerId: preSpot.ownerId,
      address: preSpot.address,
      city: preSpot.city,
      state: preSpot.state,
      country: preSpot.country,
      lat: preSpot.lat,
      lng: preSpot.lng,
      name: preSpot.name,
      description: preSpot.description,
      price: preSpot.price,
      createdAt: preSpot.createdAt,
      updatedAt: preSpot.updatedAt,
      numReviews,
      avgStarRating,
      SpotImage: preSpot.SpotImage,
      Owner: preSpot.Owner,
    };

    res.json(spotResult);
  } catch (e) {
    next(e);
  }
});

// GET /spots/:spotId/reviews - Get all reviews for a spot
router.get("/:spotId/reviews", async (req, res, next) => {
  const spotId = req.params.spotId;
  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const spotReviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });
    res.json(spotReviews);
  } catch (error) {
    next(error);
  }
});
//Create a spot
router.post('/', requireAuth, validateSpot, async (req, res, next) => {
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;


  // Validation errors object
  let errors = {};

  // Required fields validation
  if (!address) errors.address = "Street address is required";
  if (!city) errors.city = "City is required";
  if (!state) errors.state = "State is required";
  if (!country) errors.country = "Country is required";

  // Latitude validation (must be between -90 and 90)
  if (lat === undefined || lat < -90 || lat > 90) {
    errors.lat = "Latitude must be within -90 and 90";
  }

  // Longitude validation (must be between -180 and 180)
  if (lng === undefined || lng < -180 || lng > 180) {
    errors.lng = "Longitude must be within -180 and 180";
  }

  // Name validation (must be less than 50 characters)
  if (!name || name.length > 50) {
    errors.name = "Name must be less than 50 characters";
  }

  // Description validation (must not be empty)
  if (!description) {
    errors.description = "Description is required";
  }

  // Price validation (must be a positive number)
  if (price === undefined || price <= 0) {
    errors.price = "Price per day must be a positive number";
  }

  // If there are validation errors, return a 400 response with the errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation Error",
      errors,
    });
  }

  try {
    const spot = await Spot.create({
      ownerId,
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

    // If spot creation fails
    if (!spot) {
      const err = new Error("Spot couldn't be created");
      err.status = 404;
      return next(err);
    }

    // Send the response with status 201 Created
    res.status(201).json({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
    });
  } catch (e) {
    next(e);
  }
});



//add image
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
  const ownerId = req.user.id;
  const { url, preview } = req.body;
  const spotId = req.params.spotId;

  try {
    // Find the spot
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      next(err);
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== ownerId) {
      const err = new Error("Forbidden");
      err.status = 403;
      next(err);
    }

    // Create and add the image
    const newImage = await SpotImage.create({
      spotId,
      url,
      preview
    });
    const formattedImage = {
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    };
    res.status(201).json(formattedImage);
  } catch (e) {
    next(e);
  }
});
// create a booking from a spot based on spot id
router.post("/:spotId/bookings", requireAuth, validateBooking, async (req, res, next) => {
  const ownerId = req.user.id;
  const { startDate, endDate } = req.body;
  const spotId = req.params.spotId;
    try {
      // check if the spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        const err = new Error("Spot Image couldn't be found");
        err.status = 404;
        next(err);
      }

      // check if the user is the owner of the spot
      if (spot.ownerId === ownerId) {
        const err = new Error("Spot must not belong to user");
        err.status = 403;
        next(err);
      }

      // booking conflicts with any existing booking
      const bookingConflicts = await Booking.findAll({
        where: {
          spotId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
        },
      });

      if (bookingConflicts.length > 0) {
        const err = new Error(
          "Sorry, this spot is already booked for the specified dates"
        );
        err.status = 403;
        return next(err);
      }

      const booking = await Booking.create({
        spotId,
        userId: ownerId,
        startDate,
        endDate,
      });
      res.status(201).json(booking);
    } catch (e) {
      next(e);
    }
  }
);
// Create a review for a spot based on spot id
// /api/spots/:spotId/reviews
router.post("/:spotId/reviews", requireAuth, validateReview, async (req, res, next) => {
    const spotId = req.params.spotId;
    const { review, stars } = req.body;
    // get the userId to add the review. Comes from restoreUser middleware
    const userId = req.user.id;

    // 400 Status for body errors

    try {
      // check if spot exists
      const spot = await Spot.findByPk(spotId);

      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // user can not review their own spot
      if (spot.ownerId === userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Can not review your own spot" });
      }

      // check if review already exists
      const existingReview = await Review.findOne({
        where: { spotId, userId: userId },
      });
      if (existingReview) {
        return res
          .status(500)
          .json({ message: "User already has a review for this spot" });
      }

      const newReview = await Review.create({
        spotId,
        userId: userId,
        review,
        stars,
      });
      res.status(201).json(newReview);
    } catch (error) {
      next(error);
    }
  }
);



// Edit a spot
// /api/spots/:spotId
// Also requires proper authorization in addition to authentication
router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const ownerId = req.user.id;

  // 400 Status for body errors

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await spot.update({
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
    await spot.save();

    res.json(spot);
  } catch (error) {
    next(error);
  }
});




// DELETE /spots/:id - Delete a spot
router.delete('/:spotId', requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const ownerId = req.user.id;

  try {
    // spot by ID
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found"});
    }

    // if the auth user is the owner of the spot?
    if (spot.ownerId !== ownerId) {
      return res.status(403).json({ message: 'Forbidden', });
    }

    // Delete spot
    spot.destroy();

    // Return a success message
    res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (error) {
    next(error);
  }
});



// get all bookings for a spot based on spot id
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const currentUserId = req.user.id; //req.user contains the authenticated user info

  try {
    // Find the spot first to check ownership
    const spot = await Spot.findByPk(spotId);

    // If the spot is not found, return a 404 error
    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }

    // Determine if the current user is the owner of the spot
    const isOwner = spot.ownerId === currentUserId;

    // Set up the include for the Booking model
    let bookings;

    // If the user is the owner, include all details
    if (isOwner) {
      bookings = await Booking.findAll({
        where: { spotId },
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName"], // only has id, firstName, lastName
            as: "User",
          },
        ],
      });

      return res.json({ Bookings: bookings });
    }

    // if the user is not the owner of the spot, only include basic details
    bookings = await Booking.findAll({
      where: { spotId },
      attributes: ["spotId", "startDate", "endDate"],
    });
    return res.json({ Booking: bookings });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
