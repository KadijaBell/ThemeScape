const express = require("express");
const { SpotImage } = require("../../db/models");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");



