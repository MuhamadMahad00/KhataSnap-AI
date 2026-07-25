const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixDates() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/khatasnap');
  console.log('MongoDB Connected');
  const db = mongoose.connection.db;
  const receipts = await db.collection('receipts').find({}).toArray();
  console.log(`Found ${receipts.length} receipts.`);

  const now = new Date();
  for (let i = 0; i < receipts.length; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (i * 3)); // 0 days ago, 3 days ago, etc.
    await db.collection('receipts').updateOne(
      { _id: receipts[i]._id },
      { $set: { date: d } }
    );
    console.log(`Updated receipt ${receipts[i]._id} (${receipts[i].vendor}) to date: ${d.toISOString().split('T')[0]}`);
  }
  console.log('ALL RECEIPT DATES UPDATED SUCCESSFULLY!');
  process.exit(0);
}

fixDates().catch(err => {
  console.error(err);
  process.exit(1);
});
