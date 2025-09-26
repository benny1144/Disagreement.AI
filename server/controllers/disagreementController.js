import asyncHandler from "express-async-handler";
import Disagreement from "../models/Disagreement.js";

// @desc    Get disagreements
// @route   GET /api/disagreements
// @access  Private
const getDisagreements = asyncHandler(async (req, res) => {
  const disagreements = await Disagreement.find({ user: req.user.id });
  res.status(200).json(disagreements);
});

// @desc    Set disagreement
// @route   POST /api/disagreements
// @access  Private
const setDisagreement = asyncHandler(async (req, res) => {
  if (!req.body.text) {
    res.status(400);
    throw new Error("Please add a text field");
  }

  const disagreement = await Disagreement.create({
    text: req.body.text,
    user: req.user.id,
  });

  res.status(200).json(disagreement);
});

// @desc    Update disagreement
// @route   PUT /api/disagreements/:id
// @access  Private
const updateDisagreement = asyncHandler(async (req, res) => {
  const disagreement = await Disagreement.findById(req.params.id);

  if (!disagreement) {
    res.status(400);
    throw new Error("Disagreement not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the disagreement user
  if (disagreement.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const updatedDisagreement = await Disagreement.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json(updatedDisagreement);
});

// @desc    Delete disagreement
// @route   DELETE /api/disagreements/:id
// @access  Private
const deleteDisagreement = asyncHandler(async (req, res) => {
  const disagreement = await Disagreement.findById(req.params.id);

  if (!disagreement) {
    res.status(400);
    throw new Error("Disagreement not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the disagreement user
  if (disagreement.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await disagreement.deleteOne();

  res.status(200).json({ id: req.params.id });
});

export {
  getDisagreements,
  setDisagreement,
  updateDisagreement,
  deleteDisagreement,
};
