const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("URI:", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (err) {
    console.error("FULL ERROR:");
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;