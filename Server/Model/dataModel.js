const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  HR_name: String,
  Company_name: String,
  Email: String,
});

const DataModel = mongoose.model("Data", DataSchema);

module.exports = DataModel;
