const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;