const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/* 1. Create the Schema */
const eventSchema = new Schema({
  title: {
    type: String,
    required: true /** String! in graphql schema */,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date /** We do have Date type in mongodb so */,
    required: true,
  },
  creator:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
});

/* 1. Create the Model and export it ot use in required files*/
module.exports = mongoose.model("Event", eventSchema);
