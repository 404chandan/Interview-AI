import mongoose from 'mongoose';
import { Interview, FeedbackReport } from './models/Schemas.js';

const MONGO_URI = 'mongodb+srv://chandanworks91_db_user:Chandan123@cluster0.s9l4khc.mongodb.net';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");
    
    const interviews = await Interview.find({});
    console.log(`Total interviews in DB: ${interviews.length}`);
    console.log(JSON.stringify(interviews.slice(0, 5), null, 2));
    
    const completed = await Interview.find({ status: 'completed' });
    console.log(`Completed interviews: ${completed.length}`);
    
    const reports = await FeedbackReport.find({});
    console.log(`Total reports in DB: ${reports.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
