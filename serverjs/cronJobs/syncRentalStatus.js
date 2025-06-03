const cron = require("node-cron");
const mongoose = require("mongoose");
const Rental = require("../models/Rental");
const Board = require("../models/Boards");
require("dotenv").config();

if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

cron.schedule("54 23 * * *", async () => {
  console.log("🔄 [CRON] Running rental status sync");

  try {
    const today = new Date();

    // 1. Get active rentals
    const activeRentals = await Rental.find({
      agreementAccepted: true,
      availableUntil: { $gte: today },
    }).select("board");

    const activeBoardIds = activeRentals.map(r => r.board.toString());

    // 2. Ensure ALL boards have isRented field (set to false if missing)
    await Board.updateMany(
      { isRented: { $exists: false } },
      { $set: { isRented: false } }
    );

    // 3. Mark active rentals as rented
    await Board.updateMany(
      { _id: { $in: activeBoardIds } },
      { $set: { isRented: true } }
    );

    // 4. Mark all others as not rented (even if they already are false)
    await Board.updateMany(
      { _id: { $nin: activeBoardIds } },
      { $set: { isRented: false } }
    );

    console.log(`✅ [CRON] Synced ${activeBoardIds.length} active rentals`);
  } catch (err) {
    console.error("❌ [CRON] Error during sync:", err);
  }
});
