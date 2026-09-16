require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("./models/User");
const Post = require("./models/Post");
const Meetup = require("./models/Meetup");

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Meetup.deleteMany({})]);

  const password = await bcrypt.hash("password123", 10);

  const [mira, anders, yuki, you] = await User.create([
    {
      name: "Mira K.",
      email: "mira@example.com",
      password,
      tier: 3,
      bio: "Photographer, mostly film. I plan slow and I show up early. Happy to share a hike or a long coffee.",
      interests: ["HIKING", "FILM PHOTO", "SLOW TRAVEL", "VEGETARIAN"],
      city: "Lisbon",
      country: "Portugal",
      nextDestination: { city: "Porto", date: new Date("2026-10-02") },
      ratingAvg: 4.9,
      ratingCount: 32,
      ratingTagCounts: { RELIABLE: 30, FRIENDLY: 26, SAFE: 23 },
    },
    {
      name: "Anders L.",
      email: "anders@example.com",
      password,
      tier: 3,
      bio: "Chasing quiet viewpoints before sunrise.",
      interests: ["PHOTOGRAPHY", "EARLY RISER"],
      city: "Lisbon",
      country: "Portugal",
      ratingAvg: 4.7,
      ratingCount: 18,
    },
    {
      name: "Yuki T.",
      email: "yuki@example.com",
      password,
      tier: 2,
      bio: "Day-tripping through Sintra this month.",
      interests: ["HIKING", "DAY TRIPS"],
      city: "Sintra",
      country: "Portugal",
      ratingAvg: 4.6,
      ratingCount: 9,
    },
    {
      name: "Demo Traveler",
      email: "demo@example.com",
      password,
      tier: 3,
      bio: "Trying out TravelWithMe.",
      interests: ["SLOW TRAVEL"],
      city: "Lisbon",
      country: "Portugal",
      ratingAvg: 4.8,
      ratingCount: 19,
    },
  ]);

  await Post.create([
    { author: anders._id, caption: "Found the miradouro with no queue. Heading back tomorrow at sunrise if anyone wants the quiet version of it.", location: "Alfama, Lisbon" },
    { author: mira._id, caption: "Slow travel, film cameras, long hikes. In Lisbon for 3 weeks.", location: "Lisbon" },
    { author: yuki._id, caption: "Day trip, 3 seats free in the car to Sintra tomorrow.", location: "Sintra" },
  ]);

  await Meetup.create([
    {
      host: mira._id,
      title: "Tram 28 photo walk",
      description: "We ride the 28 to Graça, walk back down through Alfama and stop for lunch. Bring whatever camera you have.",
      category: "Photo walk",
      placeName: "Praça do Comércio",
      startsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      durationMinutes: 180,
      capacity: 10,
      minTier: 2,
      attendees: [mira._id, anders._id, you._id],
    },
  ]);

  console.log("Seeded database. Demo login: demo@example.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
