const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('../models/Club');
const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: '.env' });

const seedClubs = [
  {
    name: "Elite Science Collective",
    description: "A hub for experimental research, scientific debate, and collaborative innovation in physics, biology, and chemistry.",
    category: "Academic",
    status: "Active"
  },
  {
    name: "Vanguard Football Club",
    description: "The premier competitive football organization on campus. Professional training, inter-university leagues, and a passion for the beautiful game.",
    category: "Sports",
    status: "Active"
  },
  {
    name: "Global Cultural Syndicate",
    description: "Celebrating diversity through art, music, food, and traditional festivals. A home for international perspectives and heritage.",
    category: "Cultural",
    status: "Active"
  },
  {
    name: "Strategic Chess Alliance",
    description: "Master the art of the 64 squares. Regular tournaments, grandmaster analysis sessions, and strategic gameplay for all skill levels.",
    category: "Other",
    status: "Active"
  },
  {
    name: "Chronicles History Society",
    description: "Exploring the past to understand the future. Archives research, historical reenactments, and deep dives into the events that shaped our world.",
    category: "Academic",
    status: "Active"
  }
];

const runSeeder = async () => {
  try {
    await connectDB();

    // Clear existing clubs only if you want a fresh start, otherwise just create
    // For this task, we will just create them.
    
    for (const clubData of seedClubs) {
      // Check if club already exists to avoid duplicates
      const exists = await Club.findOne({ name: clubData.name });
      if (!exists) {
        await Club.create(clubData);
        console.log(`Successfully established: ${clubData.name}`);
      } else {
        console.log(`Protocol Skip: ${clubData.name} already exists in directory.`);
      }
    }

    console.log("Seeding process complete. Uplink closed.");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

runSeeder();
