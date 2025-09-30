import Disagreement from "../models/Disagreement.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import OpenAI from "openai";

// @desc    Create a new disagreement
const createDisagreement = asyncHandler(async (req, res) => {
  const { title, ai_mode } = req.body;
  if (!title) {
    res.status(400);
    throw new Error("Please provide a title.");
  }
  // FIXED: Added back the required 'user' field and a default for 'ai_mode'
  const disagreement = await Disagreement.create({
    title,
    ai_mode: ai_mode || "Fact-Finder",
    user: req.user.id,
    participants: [req.user.id],
  });

  if (disagreement) {
    // FIX: Return the entire disagreement object.
    // The 'messages' property will be an empty array by default, which is correct.
    res.status(201).json(disagreement);
  } else {
    res.status(400);
    throw new Error("Invalid disagreement data, creation failed.");
  }
});

// @desc    Get all disagreements for the logged-in user
// KEPT YOUR IMPROVEMENT: This is great with populate and sort.
const getDisagreements = asyncHandler(async (req, res) => {
  const disagreements = await Disagreement.find({ participants: req.user.id })
    .populate("participants", "name email")
    .sort({ updatedAt: -1 });
  res.json(disagreements);
});

// @desc    Get a single disagreement by ID
// KEPT YOUR IMPROVEMENT: The .some() check is more robust.
const getDisagreementById = asyncHandler(async (req, res) => {
  const disagreement = await Disagreement.findById(req.params.id)
    .populate("participants", "name email");
  if (!disagreement) {
    res.status(404);
    throw new Error("Disagreement not found");
  }
  if (!disagreement.participants.some(p => p._id.equals(req.user.id))) {
    res.status(401);
    throw new Error("User not authorized to view this disagreement.");
  }
  res.status(200).json(disagreement);
});

// @desc    Add a message to a disagreement
// KEPT YOUR IMPROVEMENT: This version is well-commented and clean.
const addMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Please provide message text.");
  }

  const disagreement = await Disagreement.findById(req.params.id);

  if (!disagreement) {
    res.status(404);
    throw new Error("Disagreement not found.");
  }

  // Ensure the user is a participant
  if (!disagreement.participants.some((p) => p._id.equals(req.user.id))) {
    res.status(403);
    throw new Error("User is not a participant of this disagreement.");
  }

  const message = {
    text: text,
    user: req.user.id,
  };

  disagreement.messages.push(message);
  await disagreement.save();

  const populatedDisagreement = await Disagreement.findById(disagreement._id)
    .populate("participants", "name email")
    .populate("messages.user", "name email");

  // Emit the event to all clients listening on this disagreement's "room"
  const eventName = `disagreement:${disagreement._id}:messages`;
  req.io.emit(eventName, populatedDisagreement.messages);

  // Respond to the original request
  res.status(201).json(populatedDisagreement);
});

// @desc    Invite a user to a disagreement
// ADDED: The missing invite function
const inviteUserToDisagreement = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const disagreementId = req.params.id;

  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    res.status(404);
    throw new Error("User with that email not found.");
  }

  const disagreement = await Disagreement.findById(disagreementId);
  if (!disagreement) {
    res.status(404);
    throw new Error("Disagreement not found.");
  }
  
  if (!disagreement.participants.includes(req.user.id)) {
    res.status(403);
    throw new Error("You are not authorized to invite users to this disagreement.");
  }

  if (disagreement.participants.includes(userToInvite._id)) {
    res.status(400);
    throw new Error("User is already a participant.");
  }

  disagreement.participants.push(userToInvite._id);
  await disagreement.save();
  
  const populatedDisagreement = await Disagreement.findById(disagreement._id)
    .populate("participants", "name email")
    .populate("messages.user", "name email");

  // FIX: Access io from the request object
  const eventName = `disagreement:${disagreement._id}:messages`;
  req.io.emit(eventName, populatedDisagreement.messages);

  // Return the full populated disagreement object.
  res.status(200).json(populatedDisagreement);
});

// @desc    Remove a disagreement
// KEPT YOUR IMPROVEMENT: This is a great implementation.
const removeDisagreement = asyncHandler(async (req, res) => {
  const disagreement = await Disagreement.findById(req.params.id);
  if (!disagreement) {
    res.status(404);
    throw new Error("Disagreement not found");
  }
  if (!disagreement.participants.some(p => p._id.equals(req.user.id))) {
    res.status(401);
    throw new Error("User not authorized to delete this disagreement.");
  }
  await disagreement.deleteOne(); // Use deleteOne() for modern Mongoose
  res.status(200).json({ message: "Disagreement removed successfully." });
});

// @desc    Analyze a disagreement's messages
const analyzeDisagreement = asyncHandler(async (req, res) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const disagreement = await Disagreement.findById(req.params.id).populate(
    "messages.user",
    "name"
  );

  if (!disagreement) {
    res.status(404);
    throw new Error("Disagreement not found.");
  }

  if (!disagreement.participants.some((p) => p._id.equals(req.user.id))) {
    res.status(403);
    throw new Error("User not authorized to analyze this disagreement.");
  }

  const chatHistory = disagreement.messages
    .map((msg) => `${msg.user.name}: ${msg.text}`)
    .join("\n");

  const systemPrompt = `You are a neutral, third-party mediator. Your task is to analyze the following disagreement titled "${disagreement.title}" and provide a concise, objective summary of the key points from each side. Do not take a side or declare a winner. Focus on clarifying the core issues.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: chatHistory },
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  const aiMessage = {
    text: aiResponse,
    user: process.env.AI_USER_ID,
  };

  disagreement.messages.push(aiMessage);
  await disagreement.save();

  const populatedDisagreement = await Disagreement.findById(disagreement._id)
    .populate("participants", "name email")
    .populate("messages.user", "name email");

  const eventName = `disagreement:${disagreement._id}:messages`;
  req.io.emit(eventName, populatedDisagreement.messages);

  res.status(200).json(populatedDisagreement);
});

export {
  createDisagreement,
  getDisagreements,
  getDisagreementById,
  addMessage,
  inviteUserToDisagreement,
  removeDisagreement,
  analyzeDisagreement,
};