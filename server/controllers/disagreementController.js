const Disagreement = require('../models/disagreementModel');
const User = require('../models/userModel');
const OpenAI = require('openai');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure the S3 client for Cloudflare R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// @desc    Create a new disagreement
// @route   POST /api/disagreements
// @access  Private
const createDisagreement = async (req, res) => {
  const { title, ai_mode } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Please provide a title.' });
  }
  try {
    const disagreement = await Disagreement.create({
      title,
      ai_mode,
      participants: [req.user._id],
    });
    res.status(201).json(disagreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all disagreements for the logged-in user
// @route   GET /api/disagreements
// @access  Private
const getDisagreements = async (req, res) => {
  try {
    const disagreements = await Disagreement.find({ participants: req.user._id });
    res.status(200).json(disagreements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single disagreement by ID
// @route   GET /api/disagreements/:id
// @access  Private
const getDisagreementById = async (req, res) => {
  try {
    const disagreement = await Disagreement.findById(req.params.id);
    if (!disagreement) {
      return res.status(404).json({ message: 'Disagreement not found.' });
    }
    if (!disagreement.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'User not authorized for this disagreement.' });
    }
    res.status(200).json(disagreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Invite a user to a disagreement
// @route   POST /api/disagreements/:id/invite
// @access  Private
const inviteUserToDisagreement = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email to invite.' });
  }
  try {
    const disagreement = await Disagreement.findById(req.params.id);
    const userToInvite = await User.findOne({ email });
    if (!disagreement) {
      return res.status(404).json({ message: 'Disagreement not found.' });
    }
    if (!userToInvite) {
      return res.status(404).json({ message: 'User with this email not found.' });
    }
    if (!disagreement.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'User not authorized to invite others.' });
    }
    if (disagreement.participants.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a participant.' });
    }
    disagreement.participants.push(userToInvite._id);
    await disagreement.save();
    res.status(200).json(disagreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Trigger AI analysis and save it as a message
// @route   POST /api/disagreements/:id/analyze
// @access  Private
const analyzeDisagreement = async (req, res) => {
  try {
    const disagreement = await Disagreement.findById(req.params.id)
      .populate('messages.sender', 'name');
    if (!disagreement) { return res.status(404).json({ message: 'Disagreement not found.' }); }
    if (!disagreement.participants.includes(req.user._id)) { return res.status(403).json({ message: 'User not authorized for this disagreement.' }); }
    
    let chatHistory = disagreement.messages.map(msg => {
      const senderName = msg.sender ? msg.sender.name : 'A Deleted User';
      return `${senderName}: ${msg.text}`;
    }).join('\n');
    
    if (disagreement.messages.length === 0) {
      chatHistory = "There are no messages in this disagreement yet. Please provide an opening statement or summary based on the title.";
    }

    const WORD_LIMIT = 20000;
    if (chatHistory.split(' ').length > WORD_LIMIT) {
      return res.status(429).json({ message: `Chat history is too long (over ${WORD_LIMIT} words). Please summarize your points before proceeding.` });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are an AI assistant acting as a ${disagreement.ai_mode} for a disagreement titled "${disagreement.title}". Analyze the following conversation and provide your neutral, third-party analysis.` },
        { role: "user", content: chatHistory }
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    const aiMessage = {
      text: aiResponse,
      sender: process.env.AI_USER_ID,
    };
    
    disagreement.messages.push(aiMessage);
    await disagreement.save();
    
    res.status(200).json(disagreement);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: 'Error analyzing disagreement', error: error.message });
  }
};

// @desc    Generate a pre-signed URL for file upload
// @route   POST /api/disagreements/:id/upload
// @access  Private
const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ message: 'fileName and fileType are required.' });
    }

    const disagreementId = req.params.id;
    const userId = req.user._id;

    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const fileKey = `${disagreementId}/${userId}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    res.status(200).json({ uploadUrl, fileKey });

  } catch (error) {
    console.error("URL Generation Error:", error);
    res.status(500).json({ message: 'Error generating upload URL', error: error.message });
  }
};

module.exports = {
  createDisagreement,
  getDisagreements,
  getDisagreementById,
  inviteUserToDisagreement,
  analyzeDisagreement,
  generateUploadUrl,
};