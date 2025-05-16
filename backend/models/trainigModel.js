import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema({
  problem: {
    type: String,
    required: true,
  },
},{timestamps: true});

const trainingModel = mongoose.model("Training", trainingSchema);
export default trainingModel;
