require("dotenv").config();
const mongoose = require("mongoose");

const mongoConnectOptions = require("../src/config/mongoConnectOptions");
const User = require("../src/models/User");
const Club = require("../src/models/Club");
const Membership = require("../src/models/Membership");
const Event = require("../src/models/Event");
const Post = require("../src/models/Post");
const Discussion = require("../src/models/Discussion");
const Expense = require("../src/models/Expense");
const Payment = require("../src/models/Payment");
const Attendance = require("../src/models/Attendance");

async function seedDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Set it in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, mongoConnectOptions);
  console.log("Connected to MongoDB for seeding");

  await Promise.all([
    Attendance.deleteMany({}),
    Payment.deleteMany({}),
    Expense.deleteMany({}),
    Discussion.deleteMany({}),
    Post.deleteMany({}),
    Event.deleteMany({}),
    Membership.deleteMany({}),
    Club.deleteMany({}),
    User.deleteMany({})
  ]);

  const fixedUsers = await User.create([
    {
      name: "System Admin",
      email: "admin@clubdiary.local",
      password: "password123",
      role: "Admin",
      department: "Administration",
      bio: "Initial seeded administrator account."
    },
    {
      name: "Ayesha Rahman",
      email: "president@clubdiary.local",
      password: "password123",
      role: "President",
      department: "Computer Science",
      bio: "President of the Programming Club."
    },
    {
      name: "Tanvir Hossain",
      email: "student@clubdiary.local",
      password: "password123",
      role: "Student",
      department: "Electrical Engineering",
      bio: "Active member interested in events and discussions."
    }
  ]);

  const [admin, president, student] = fixedUsers;

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Business Administration",
    "English",
    "Economics"
  ];
  const bangladeshiStudentNames = [
    "Nusrat Jahan",
    "Mehedi Hasan",
    "Farzana Akter",
    "Rakibul Islam",
    "Sumaiya Rahman",
    "Sabbir Ahmed",
    "Mst Riya Khatun",
    "Naimur Rahman",
    "Tanjina Sultana",
    "Shanto Roy",
    "Mariam Khatun",
    "Arif Hossain",
    "Jannatul Ferdous",
    "Siam Mahmud",
    "Laboni Akter",
    "Fahim Chowdhury",
    "Tasnia Anjum"
  ];
  const studentUsersPayload = bangladeshiStudentNames.map((name, idx) => ({
    name,
    email: `student${idx + 1}@clubdiary.local`,
    password: "password123",
    role: "Student",
    department: departments[idx % departments.length],
    bio: `Seeded student profile for ${name}.`
  }));
  const extraStudents = await User.create(studentUsersPayload);
  const allStudents = [student, ...extraStudents];

  const clubs = await Club.create([
    {
      name: "Programming Club",
      category: "Technology",
      description: "Coding contests, workshops, and open-source projects."
    },
    {
      name: "Robotics Club",
      category: "Engineering",
      description: "Hands-on robotics projects and hardware practice."
    },
    {
      name: "Debate Club",
      category: "Public Speaking",
      description: "Practice argumentation, debate formats, and communication."
    },
    {
      name: "Photography Club",
      category: "Arts",
      description: "Photo walks, editing sessions, and visual storytelling."
    },
    {
      name: "Entrepreneurship Club",
      category: "Business",
      description: "Startup ideas, pitch practice, and innovation challenges."
    }
  ]);
  const [programmingClub, roboticsClub, debateClub, photographyClub, entrepreneurshipClub] = clubs;

  const membershipRecords = [{ user: president._id, club: programmingClub._id, status: "approved" }];
  allStudents.forEach((member, idx) => {
    membershipRecords.push({
      user: member._id,
      club: clubs[idx % clubs.length]._id,
      status: "approved"
    });
    membershipRecords.push({
      user: member._id,
      club: clubs[(idx + 1) % clubs.length]._id,
      status: idx % 4 === 0 ? "pending" : "approved"
    });
    membershipRecords.push({
      user: member._id,
      club: clubs[(idx + 2) % clubs.length]._id,
      status: idx % 5 === 0 ? "rejected" : "pending"
    });
  });
  await Membership.create(membershipRecords);

  const events = await Event.create([
    {
      title: "Intro to Node.js Workshop",
      description: "A beginner-friendly workshop for backend fundamentals.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      club: programmingClub._id,
      createdBy: president._id
    },
    {
      title: "Robotics Design Sprint",
      description: "Build and test a line-following robot prototype.",
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      club: roboticsClub._id,
      createdBy: president._id
    },
    {
      title: "Debate Fundamentals Session",
      description: "Practice opening statements and rebuttal structure.",
      date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      club: debateClub._id,
      createdBy: president._id
    }
  ]);

  await Post.create([
    {
      title: "Welcome to the New Semester",
      content:
        "We are excited to start this semester with workshops, hack nights, and team projects.",
      club: programmingClub._id,
      author: president._id
    },
    {
      title: "Photo Walk Announcement",
      content: "Join our golden-hour photo walk this Friday evening.",
      club: photographyClub._id,
      author: president._id
    },
    {
      title: "Startup Pitch Day",
      content: "Prepare your 3-minute pitch and submit your deck by Thursday.",
      club: entrepreneurshipClub._id,
      author: president._id
    }
  ]);

  await Discussion.create([
    {
      club: programmingClub._id,
      text: "Share your ideas for the first monthly coding challenge.",
      createdBy: allStudents[0]._id
    },
    {
      club: roboticsClub._id,
      text: "Which microcontroller should we use this semester?",
      createdBy: allStudents[1]._id
    },
    {
      club: debateClub._id,
      text: "Suggest topics for next inter-university debate.",
      createdBy: allStudents[2]._id
    }
  ]);

  await Expense.create([
    {
      club: programmingClub._id,
      title: "Workshop Snacks",
      amount: 1500,
      receiptUrl: "",
      createdBy: president._id
    },
    {
      club: roboticsClub._id,
      title: "Sensor Kit Purchase",
      amount: 4200,
      receiptUrl: "",
      createdBy: president._id
    },
    {
      club: photographyClub._id,
      title: "Print Exhibition Materials",
      amount: 2100,
      receiptUrl: "",
      createdBy: president._id
    }
  ]);

  const paymentRecords = [];
  allStudents.slice(0, 15).forEach((member, idx) => {
    paymentRecords.push({
      user: member._id,
      club: clubs[idx % clubs.length]._id,
      amount: 300 + (idx % 3) * 50,
      billingPeriod: `2026-${String((idx % 6) + 1).padStart(2, "0")}`
    });
  });
  await Payment.create(paymentRecords);

  const attendanceRecords = [];
  allStudents.slice(0, 12).forEach((member, idx) => {
    const event = events[idx % events.length];
    attendanceRecords.push({
      event: event._id,
      user: member._id,
      scanCode: `SEED-${event._id.toString().slice(-3)}-${member._id.toString().slice(-4)}`
    });
  });
  await Attendance.create(attendanceRecords);

  console.log("Database seeded successfully");
  console.log(`Users: ${fixedUsers.length + extraStudents.length}`);
  console.log(`Clubs: ${clubs.length}`);
  console.log(`Memberships: ${membershipRecords.length} (approved/pending/rejected)`);
  console.log(`Events: ${events.length}, Posts: 3, Discussions: 3`);
  console.log(`Expenses: 3, Payments: ${paymentRecords.length}, Attendance: ${attendanceRecords.length}`);
  console.log("Demo login accounts:");
  console.log("Admin: admin@clubdiary.local / password123");
  console.log("President: president@clubdiary.local / password123");
  console.log("Student: student@clubdiary.local / password123");
}

seedDatabase()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
