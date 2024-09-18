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
    where: {
      lat: { [Op.between]: [minLat || -90, maxLat || 90] },
      lng: { [Op.between]: [minLng || -180, maxLng || 180] },
      price: {
        [Op.between]: [minPrice || 0, maxPrice || Number.MAX_SAFE_INTEGER],
      },
    },
    limit: size,
    offset: (page - 1) * size,
    include: [
      {
        model: SpotImage,
        attributes: ["url", "preview"],
      },
      {
        model: Review,
        attributes: ["stars"],
        required: false,
      },
    ],
  });

  let spotsList = spots.map((spot) => spot.toJSON());

  // Process each spot to include avgRating and previewImage
  spotsList.forEach((spot) => {
    // Calculate average rating
    let totalStars = 0;
    let reviewCount = 0;
    spot.Review.forEach((review) => {
      totalStars += review.stars;
      reviewCount++;
    });

    if (reviewCount > 0) {
      spot.avgRating = parseFloat((totalStars / reviewCount).toFixed(1));
    } else {
      spot.avgRating = null;
    }
    delete spot.Reviews; // Remove Reviews after processing avgRating

    // Calculate preview image
    spot.SpotImage.forEach((image) => {
      if (image.preview === true) {
        spot.previewImage = image.url;
      }
    });
    if (!spot.previewImage) {
      spot.previewImage = "No preview image available";
    }
    delete spot.SpotImage; // Remove SpotImages after processing previewImage

    return spot;
  });

  res.json({ Spots: spotsList, page, size });
});


// // GET all spots filtered with query parameters
// router.get('/', async (req, res) => {
//   let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

//   // Convert query parameters to proper types
//   page = parseInt(page) || 1;  // Default to 1 if invalid or not provided
//   size = parseInt(size) || 20;  // Default to 20 if invalid or not provided
//   minLat = minLat !== undefined ? parseFloat(minLat) : undefined;
//   maxLat = maxLat !== undefined ? parseFloat(maxLat) : undefined;
//   minLng = minLng !== undefined ? parseFloat(minLng) : undefined;
//   maxLng = maxLng !== undefined ? parseFloat(maxLng) : undefined;
//   minPrice = minPrice !== undefined ? parseFloat(minPrice) : undefined;
//   maxPrice = maxPrice !== undefined ? parseFloat(maxPrice) : undefined

//   // Validation
//   const errors = {};
//   if (isNaN(page) || page < 1) errors.page = "Page must be greater than or equal to 1";
//   if (isNaN(size) || size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
//   if (minLat !== undefined && (isNaN(minLat) || minLat < -90 || minLat > 90)) errors.minLat = "Minimum latitude is invalid";
//   if (maxLat !== undefined && (isNaN(maxLat) || maxLat < -90 || maxLat > 90)) errors.maxLat = "Maximum latitude is invalid";
//   if (minLng !== undefined && (isNaN(minLng) || minLng < -180 || minLng > 180)) errors.minLng = "Minimum longitude is invalid";
//   if (maxLng !== undefined && (isNaN(maxLng) || maxLng < -180 || maxLng > 180)) errors.maxLng = "Maximum longitude is invalid";
//   if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
//   if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";
//    // If there are errors, respond with a 400 status
//    if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//         message: "Bad Request",
//         errors
//     });
// }

// const spots = await Spot.findAll({
//     where: {
//         lat: { [Op.between]: [minLat || -90, maxLat || 90] },
//         lng: { [Op.between]: [minLng || -180, maxLng || 180] },
//         price: { [Op.between]: [minPrice || 0, maxPrice || Number.MAX_SAFE_INTEGER] }
//     },
//     limit: size,
//     offset: (page - 1) * size,
//     include: [
//         {
//             model: SpotImage,
//             attributes: ['url', 'preview']
//         },
//         {
//             model: Review,
//             attributes: ['stars'],
//             required: false
//         }
//     ]
// });
// let spotsList = spots.map(spot => spot.toJSON());

// // Process each spot to include avgRating and previewImage
// spotsList.forEach(spot => {
//     // Calculate average rating
//     let totalStars = 0;
//     let reviewCount = 0;
//     spot.Reviews.forEach(review => {
//         totalStars += review.stars;
//         reviewCount++;
//     });

//     if (reviewCount > 0) {
//         spot.avgRating = parseFloat((totalStars / reviewCount).toFixed(1));
//     } else {
//         spot.avgRating = null;
//     }
//     delete spot.Reviews; // Remove Reviews after processing avgRating

//     // Calculate preview image
//     spot.SpotImages.forEach(image => {
//         if (image.preview === true) {
//             spot.previewImage = image.url;
//         }
//     });
//     if (!spot.previewImage) {
//         spot.previewImage = 'No preview image available';
//     }
//     delete spot.SpotImages; // Remove SpotImages after processing previewImage

//     return spot;
// });

// res.json({ Spots: spotsList, page, size });
// });


//GET Spot
// router.get('/', async (req, res) => {
//   try {
//     const spots = await Spot.findAll();
//     res.json({ Spot: spots });
//   } catch (err) {
//     console.error('Error retrieving spots:', err);
//     res.status(500).json({ message: "Server error", errors: err.errors });
//   }
// });

// //GET all Spot
// router.get('/', async (req,res, err) => {
//   const spots = await Spot.findAll({
//       include:[
//       {
//           model: Review,
//           attributes: ['stars']
//       },{
//           model: SpotImage,
//           attributes: ['url', 'preview']
//       }
//   ]
//   })

//   let spotsList = [];

//   // Push each spot into spotsList
//   spots.forEach((spot) => {
//       spotsList.push(spot.toJSON());
//   });

//   const formattedSpots = spotsList.map((spot) => {
//       // Calculate average rating
//       let totalStars = 0;
//       let reviewCount = 0;
//       spot.Review.forEach((review) => {
//           totalStars += review.stars;
//           reviewCount++;
//       });

//       if (reviewCount > 0) {
//           spot.avgRating = parseFloat((totalStars / reviewCount).toFixed(1));
//       } else {
//           spot.avgRating = null;
//       }
//       delete spot.Review; // Remove Review after processing avgRating

//       // Calculate preview image
//       spot.SpotImage.forEach((image) => {
//           if (image.preview === true) {
//               spot.previewImage = image.url;
//           }
//       });
//       if (!spot.previewImage) {
//           spot.previewImage = 'No preview image available';
//       }
//       delete spot.SpotImage; // Remove SpotImage after processing previewImage

//       return spot;
//   })
//   res.json({ Spot: formattedSpots });
// });

//Create a spot
router.post('/', requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
    const newSpot = await Spot.create({
      ownerId: req.user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    });

    res.status(201).json(newSpot);
  } catch (error) {

    if (error.name === 'SequelizeValidationError') {
      const errors = {};

      for (let err of error.errors) {
          if (err.path === 'address') errors.address = "Street address is required";
          if (err.path === 'city') errors.city = "City is required";
          if (err.path === 'state') errors.state = "State is required";
          if (err.path === 'country') errors.country = "Country is required";
          if (err.path === 'lat') errors.lat = "Latitude must be within -90 and 90";
          if (err.path === 'lng') errors.lng = "Longitude must be within -180 and 180";
          if (err.path === 'name') errors.name = "Name must be less than 50 characters";
          if (err.path === 'description') errors.description = "Description is required";
          if (err.path === 'price') errors.price = "Price per day must be a positive number";
      }

      return res.status(400).json({
          message: "Bad Request",
          errors
      });
  }

  next(error);
  }
});


//query parameter validator


// router.get( '/',
//   [
//       check('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than or equal to 1'),
//       check('size').optional().isInt({ min: 1, max: 20 }).withMessage('Size must be an integer between 1 and 20'),
//       check('minLat').optional().isFloat({ min: -90, max: 90 }).withMessage('minLat must be a valid latitude'),
//       check('maxLat').optional().isFloat({ min: -90, max: 90 }).withMessage('maxLat must be a valid latitude'),
//       check('minLng').optional().isFloat({ min: -180, max: 180 }).withMessage('minLng must be a valid longitude'),
//       check('maxLng').optional().isFloat({ min: -180, max: 180 }).withMessage('maxLng must be a valid longitude'),
//       check('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be greater than or equal to 0'),
//       check('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be greater than or equal to 0'),
//   ],
//   async (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//           return res.status(400).json({ errors: errors.array() });
//       }

//       // GET /api/spots - Return spots filtered by query parameters
//   router.get('/', async (req, res) => {
//     try {
//         let { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

//         // Convert page and size to integers and apply default limits
//         page = parseInt(page);
//         size = parseInt(size);

//         // Limit the maximum page size
//         if (size > 20) size = 20;
//         if (page < 1) page = 1;

//         // Build query filters based on optional parameters
//         const filters = {};

//         if (minLat) filters.lat = { ...filters.lat, [Op.gte]: parseFloat(minLat) };
//         if (maxLat) filters.lat = { ...filters.lat, [Op.lte]: parseFloat(maxLat) };

//         if (minLng) filters.lng = { ...filters.lng, [Op.gte]: parseFloat(minLng) };
//         if (maxLng) filters.lng = { ...filters.lng, [Op.lte]: parseFloat(maxLng) };

//         if (minPrice) filters.price = { ...filters.price, [Op.gte]: parseFloat(minPrice) };
//         if (maxPrice) filters.price = { ...filters.price, [Op.lte]: parseFloat(maxPrice) };

//         // Fetch spots from the database with applied filters
//         const spots = await Spot.findAll({
//             where: filters,
//             limit: size,
//             offset: (page - 1) * size,
//             attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'],
//         });

//         // Return spots data along with pagination info
//         return res.json({
//             Spot: spots,
//             page,
//             size,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
//   });
//   }
// );

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

// //GET all SPots owned by the Current User
// router.get('/current', requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const spots = await Spot.findAll({
//       where: {ownerId: userId},
//       include: [
//           {
//               model: Review,
//               attributes: ['stars'],
//               required: false
//           },
//           {
//               model: SpotImage,
//               attributes: ['url', 'preview'],
//               required: false
//           },
//       ],
//   })

//   let spotsList = []

//   spots.forEach((spot) => {
//       spotsList.push(spot.toJSON())
//   })

//   const formattedSpots= spotsList.map((spot) => {
//       spot.SpotImages.forEach((image) => {
//           if(image.preview === true){
//               spot.previewImage = image.url
//           }
//       })
//       if(!spot.previewImage){
//           spot.previewImage = 'No preview image available'
//       }
//       delete spot.SpotImages

//       let totalStars = 0;
//       let reviewCount = 0;
//       spot.Reviews.forEach((review) => {
//           totalStars += review.stars;
//           reviewCount++;
//       })

//       if(reviewCount > 0){
//           spot.avgRating = parseFloat((totalStars / reviewCount).toFixed(1));;
//       } else {
//           spot.avgRating = null
//       }
//       delete spot.Reviews
//       return {
//           id: spot.id,
//           ownerId: spot.ownerId,
//           address: spot.address,
//           city: spot.city,
//           state: spot.state,
//           country: spot.country,
//           lat: spot.lat,
//           lng: spot.lng,
//           name: spot.name,
//           description: spot.description,
//           price: spot.price,
//           createdAt: spot.createdAt,
//           updatedAt: spot.updatedAt,
//           avgRating: spot.avgRating,
//           previewImage: spot.previewImage
//       };
//   })
//   res.json({Spots: formattedSpots})

// })

// //details of a spot from an id
// router.get('/:spotId', async (req, res) => {
//   const { spotId } = req.params;

//   try {
//     const spot = await Spot.findByPk(spotId, {
//       include: [
//         { model: SpotImage, attributes: ['id', 'url', 'preview'] },
//         { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] }
//       ]
//     });

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     return res.status(200).json(spot);
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

//   // Get Spot by ID and details (Owner, SpotImage, Review)
// router.get('/:id', async (req, res) => {
//   const spotId = req.params.id;

//   try {
//     // Find spot by ID
//     const spot = await Spot.findByPk(spotId, {
//       include: [
//         // the owner (User) data
//         {
//           model: 'User',
//           as: 'Owner',
//           attributes: ['id', 'firstName', 'lastName'],
//         },
//         // spot images
//         {
//           model: 'SpotImage',
//           attributes: ['id', 'url', 'preview'],
//         },
//       ],
//     });

//     if (!spot) {
//       return res.status(404).json({ message: 'Spot not found', statusCode: 404 });
//     }

//     // Get # of reviews and avg rating
//     const reviews = await Review.findAll({
//       where: { spotId: spot.id },
//       attributes: ['stars'],
//     });

//     const numReviews = reviews.length;
//     const avgStarRating = reviews.length
//       ? reviews.reduce((sum, review) => sum + review.stars, 0) / numReviews
//       : 0;

//     // response object
//     const spotDetails = {
//       id: spot.id,
//       ownerId: spot.ownerId,
//       address: spot.address,
//       city: spot.city,
//       state: spot.state,
//       country: spot.country,
//       lat: spot.lat,
//       lng: spot.lng,
//       name: spot.name,
//       description: spot.description,
//       price: spot.price,
//       createdAt: spot.createdAt,
//       updatedAt: spot.updatedAt,
//       numReviews: numReviews,
//       avgStarRating: avgStarRating,
//       SpotImage: spot.SpotImage,
//       Owner: spot.Owner,
//     };

//     res.json(spotDetails);
//   } catch (error) {
//     console.error('Error fetching spot details:', error);
//     res.status(500).json({ message: 'Internal server error', statusCode: 500 });
//   }
// });

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

    // preSpot.avgRating = avgStarRating;

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
      SpotImages: preSpot.SpotImages,
      Owner: preSpot.Owner,
    };

    res.json(spotResult);
  } catch (e) {
    next(e);
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

      return res.json({ Booking: bookings });
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

// GET /spots/:spotId/reviews - Get all reviews for a spot
router.get('/:spotId/reviews', async (req, res, next) => {
  const spotId  = req.params.spotId;

  try {
    // if the spot exists?
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found"
      });
    }

    // Find all reviews for the given spotId
    const spotReviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'],
        },
      ],
    });
    res.json(spotReviews);
  } catch (error) {
    next(error);
  }
});



//     return res.status(200).json({
//       Review: spotReviews.map(review => ({
//         id: review.id,
//         userId: review.userId,
//         spotId: review.spotId,
//         review: review.review,
//         stars: review.stars,
//         createdAt: review.createdAt,
//         updatedAt: review.updatedAt,
//         User: {
//           id: review.User.id,
//           firstName: review.User.firstName,
//           lastName: review.User.lastName,
//         },
//         ReviewImage: review.ReviewImage.map(image => ({
//           id: image.id,
//           url: image.url,
//         })),
//       })),
//     });
//   } catch (error) {
//     console.error('Error fetching reviews for the spot:', error);
//     return res.status(500).json({
//       message: 'Internal server error',
//       statusCode: 500,
//     });
//   }
// });

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

// // PUT /spots/:id - Update a spot
// router.put('/:id', requireAuth, async (req, res) => {
//   const spotId = req.params.id;
//   const userId = req.user.id; // `req.user.id` is set after auth
//   const { address, city, state, country, lat, lng, name, description, price } = req.body;

//   try {
//     // find spot by ID
//     const spot = await Spot.findByPk(spotId);

//     if (!spot) {
//       return res.status(404).json({ message: 'Spot not found', statusCode: 404 });
//     }

//     // if the authenticated user is the owner of spot
//     if (spot.ownerId !== userId) {
//       return res.status(403).json({ message: 'Forbidden - You are not the owner of this spot', statusCode: 403 });
//     }

//     // validate the req body
//     if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
//       return res.status(400).json({
//         message: 'Validation error - Missing required fields',
//         statusCode: 400,
//         errors: {
//           address: !address ? 'Address is required' : undefined,
//           city: !city ? 'City is required' : undefined,
//           state: !state ? 'State is required' : undefined,
//           country: !country ? 'Country is required' : undefined,
//           lat: !lat ? 'Latitude is required' : undefined,
//           lng: !lng ? 'Longitude is required' : undefined,
//           name: !name ? 'Name is required' : undefined,
//           description: !description ? 'Description is required' : undefined,
//           price: !price ? 'Price is required' : undefined,
//         },
//       });
//     }

//     // update spot with new data
//     await spot.update({
//       address,
//       city,
//       state,
//       country,
//       lat,
//       lng,
//       name,
//       description,
//       price,
//     });

//     // return updated spot details
//     return res.json({
//       id: spot.id,
//       ownerId: spot.ownerId,
//       address: spot.address,
//       city: spot.city,
//       state: spot.state,
//       country: spot.country,
//       lat: spot.lat,
//       lng: spot.lng,
//       name: spot.name,
//       description: spot.description,
//       price: spot.price,
//       createdAt: spot.createdAt,
//       updatedAt: spot.updatedAt,
//     });
//   } catch (error) {
//     console.error('Error updating spot:', error);
//     res.status(500).json({ message: 'Internal server error', statusCode: 500 });
//   }
// });

//add image
router.post('/:spotId/images', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    // Find the spot
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Create and add the image
    const newImage = await SpotImage.create({
      spotId,
      url,
      preview
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview
    });
  } catch (error) {
    console.error('Error adding image to spot:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }

})

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


// // POST /spots/:id/reviews - Create a new review for a spot
// router.post('/:id/reviews', requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const spotId = req.params.id;
//   const { review, stars } = req.body;

//   // Validate req body
//   if (!review || typeof review !== 'string' || !stars || typeof stars !== 'number' || stars < 1 || stars > 5) {
//     return res.status(400).json({
//       message: 'Validation error: Review and stars are required. Stars must be between 1 and 5.',
//       statusCode: 400,
//     });
//   }

//   try {
//     // Check if spot exists
//     const spot = await Spot.findByPk(spotId);
//     if (!spot) {
//       return res.status(404).json({
//         message: 'Spot not found',
//         statusCode: 404,
//       });
//     }

//     // Check if user has already made a review for this spot
//     const existingReview = await Review.findOne({
//       where: { userId, spotId },
//     });
//     if (existingReview) {
//       return res.status(500).json({
//         message: 'User already has a review for this spot',
//         // statusCode: 403,
//       });
//     }

//     // Create new review
//     const newReview = await Review.create({
//       userId,
//       spotId,
//       review,
//       stars,
//     });

//     // Return the new review data
//     return res.status(201).json({
//       id: newReview.id,
//       userId: newReview.userId,
//       spotId: newReview.spotId,
//       review: newReview.review,
//       stars: newReview.stars,
//       createdAt: newReview.createdAt,
//       updatedAt: newReview.updatedAt,
//     });
//   } catch (error) {
//     console.error('Error creating review:', error);
//     res.status(500).json({
//       message: 'Internal server error',
//       statusCode: 500,
//     });
//   }
// });

// DELETE /spots/:id - Delete a spot
router.delete('/:id', requireAuth, async (req, res) => {
  const spotId = req.params.id;
  const userId = req.user.id;

  try {
    // spot by ID
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found', statusCode: 404 });
    }

    // if the auth user is the owner of the spot?
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden - You are not the owner of this spot', statusCode: 403 });
    }

    // Delete spot
    await spot.destroy();

    // Return a success message
    return res.json({ message: 'Successfully deleted', statusCode: 200 });
  } catch (error) {
    console.error('Error deleting spot:', error);
    res.status(500).json({ message: 'Internal server error', statusCode: 500 });
  }
});



module.exports = router;
