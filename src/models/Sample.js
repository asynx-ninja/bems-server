const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  lvl: {
    type: Number,
    required: true,
  },
  maxWords: {
    type: Number,
    required: true,
  },
  words: {
    type: [String],
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
    required: true,
  },
  stars: {
    type: Number,
    default: 0,
    max: 3,
  },
});

const IslandSchema = new Schema(
  {
    dungeonName: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "easy", "average", "hard"],
      required: true,
    },
    maxLvl: {
      type: Number,
      default: 20,
    },
    items: {
      type: [ItemSchema],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Islands", IslandSchema);
