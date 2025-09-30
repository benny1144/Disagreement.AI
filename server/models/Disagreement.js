import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const disagreementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ai_mode: {
      type: String,
      required: true,
      default: "Fact-Finder",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Disagreement = mongoose.model("Disagreement", disagreementSchema);

export default Disagreement;
