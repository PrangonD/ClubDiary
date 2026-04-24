// Run this file ONCE to add sample clubs to your database
// Command: node seed.js

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/club_diary')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.log('❌ Error:', err); process.exit(1); });

const ClubSchema = new mongoose.Schema({
  name: String, category: String, description: String,
  memberCount: Number, meetingSchedule: String,
  contactEmail: String, tags: [String], coverImage: String,
});
const Club = mongoose.model('Club', ClubSchema);

const clubs = [
  {
    name: 'Code Crafters',
    category: 'Technology',
    description: 'A community of passionate developers who build real-world projects, host hackathons, and share knowledge about web and mobile development.',
    memberCount: 142,
    meetingSchedule: 'Every Saturday, 3:00 PM',
    contactEmail: 'codecrafters@clubdiary.com',
    tags: ['coding', 'web dev', 'hackathon'],
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
  },
  {
    name: 'Canvas & Ink',
    category: 'Arts',
    description: 'Explore visual arts through painting, sketching, digital illustration, and mixed media. Open to all skill levels!',
    memberCount: 89,
    meetingSchedule: 'Wednesdays & Sundays, 5:00 PM',
    contactEmail: 'canvasink@clubdiary.com',
    tags: ['painting', 'illustration', 'sketching'],
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
  },
  {
    name: 'Chess Masters',
    category: 'Sports',
    description: 'From beginners learning the basics to advanced players studying openings. Chess Masters welcomes everyone.',
    memberCount: 67,
    meetingSchedule: 'Tuesdays & Thursdays, 6:00 PM',
    contactEmail: 'chessmasters@clubdiary.com',
    tags: ['chess', 'strategy', 'tournament'],
    coverImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600',
  },
  {
    name: 'Robotics Lab',
    category: 'Science',
    description: 'Build, program, and compete with robots. Members work on Arduino and Raspberry Pi projects.',
    memberCount: 54,
    meetingSchedule: 'Every Friday, 4:00 PM',
    contactEmail: 'roboticslab@clubdiary.com',
    tags: ['robotics', 'arduino', 'engineering'],
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
  },
  {
    name: 'Acoustic Lounge',
    category: 'Music',
    description: 'A laid-back music club for acoustic enthusiasts. We jam, collaborate, and perform at local events.',
    memberCount: 76,
    meetingSchedule: 'Every Monday, 7:00 PM',
    contactEmail: 'acousticlounge@clubdiary.com',
    tags: ['acoustic', 'guitar', 'singing'],
    coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',
  },
  {
    name: 'Book Seekers',
    category: 'Literature',
    description: 'Monthly book discussions, author talks, and creative writing workshops. From literary fiction to sci-fi.',
    memberCount: 103,
    meetingSchedule: 'Last Sunday of every month',
    contactEmail: 'bookseekers@clubdiary.com',
    tags: ['reading', 'books', 'writing'],
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
  },
];

async function seed() {
  await Club.deleteMany({});
  console.log('🗑️  Cleared old clubs');
  await Club.insertMany(clubs);
  console.log(`🌱 Added ${clubs.length} clubs!`);
  mongoose.disconnect();
  console.log('✅ Done! Now run: node server.js');
}

seed();
