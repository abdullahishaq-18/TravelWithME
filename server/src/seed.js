require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("./models/User");
const Post = require("./models/Post");
const Meetup = require("./models/Meetup");

const avatar = (n) => `/images/avatars/avatar-${n}.jpeg`;
const post = (n) => `/images/posts/post-${String(n).padStart(2, "0")}.jpeg`;
const meetup = (n) => `/images/meetups/meetup-${String(n).padStart(2, "0")}.jpeg`;

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Meetup.deleteMany({})]);

  const password = await bcrypt.hash("password123", 10);

  const [mira, anders, yuki, demo] = await User.create([
    {
      name: "Mira K.",
      email: "mira@example.com",
      password,
      tier: 3,
      avatarUrl: avatar(1),
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
      avatarUrl: avatar(2),
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
      avatarUrl: avatar(3),
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
      avatarUrl: avatar(4),
      bio: "Trying out TravelWithMe.",
      interests: ["SLOW TRAVEL"],
      city: "Lisbon",
      country: "Portugal",
      ratingAvg: 4.8,
      ratingCount: 19,
    },
  ]);

  await Post.create([
    { author: anders._id, photoUrl: post(1), caption: "Found the miradouro with no queue. Heading back tomorrow at sunrise if anyone wants the quiet version of it.", location: "Alfama, Lisbon" },
    { author: mira._id, photoUrl: post(2), caption: "Loaded a new roll this morning. If the light holds I'll be at the castle wall until dusk.", location: "Castelo de S. Jorge, Lisbon" },
    { author: yuki._id, photoUrl: post(3), caption: "Day trip, 3 seats free in the car to Sintra tomorrow.", location: "Sintra" },
    { author: demo._id, photoUrl: post(4), caption: "Three days into TravelWithMe and already have two coffees lined up this week.", location: "Lisbon" },
    { author: mira._id, photoUrl: post(5), caption: "Found a rooftop with zero tourists. Not saying where, but I'll take one person for coffee.", location: "Lisbon" },
    { author: anders._id, photoUrl: post(6), caption: "Fixed my film scanner, first proper Lisbon roll should be ready tonight.", location: "Lisbon" },
    { author: yuki._id, photoUrl: post(7), caption: "Split a taxi to Cabo da Roca this weekend? Looking for two more.", location: "Cabo da Roca" },
    { author: demo._id, photoUrl: post(8), caption: "Learning that Lisbon hills are no joke. Send tram recommendations.", location: "Lisbon" },
    { author: mira._id, photoUrl: post(9), caption: "Golden hour at the castle again. This city doesn't miss.", location: "Lisbon" },
    { author: anders._id, photoUrl: post(10), caption: "Porto next week — anyone around there want to trade city tips?", location: "Porto" },
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
      photoUrl: meetup(1),
      attendees: [mira._id, anders._id],
    },
    {
      host: yuki._id,
      title: "Sintra day hike",
      description: "Trail up to the Moorish Castle, then down through the National Palace gardens. Pack water and good shoes.",
      category: "Hiking",
      placeName: "Sintra National Palace",
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 300,
      capacity: 8,
      minTier: 1,
      photoUrl: meetup(2),
      attendees: [yuki._id],
    },
    {
      host: anders._id,
      title: "Belém pastel crawl",
      description: "Tower, monastery, then the original pastelaria. Casual pace, lots of photo stops.",
      category: "Food & sightseeing",
      placeName: "Belém Tower",
      startsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      durationMinutes: 150,
      capacity: 12,
      minTier: 1,
      photoUrl: meetup(3),
      attendees: [anders._id, mira._id],
    },
    {
      host: mira._id,
      title: "Alfama sunset rooftop",
      description: "Small group, one rooftop, no address until you RSVP. Bring your own drink.",
      category: "Social",
      placeName: "Miradouro das Portas do Sol",
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 120,
      capacity: 6,
      minTier: 3,
      photoUrl: meetup(4),
      attendees: [mira._id],
    },
    {
      host: demo._id,
      title: "LX Factory Sunday market",
      description: "Browsing the market stalls, then coffee at Ler Devagar. Open to anyone new in town.",
      category: "Market",
      placeName: "LX Factory",
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      durationMinutes: 180,
      capacity: 10,
      minTier: 2,
      photoUrl: meetup(5),
      attendees: [demo._id],
    },
  ]);

  console.log("Seeded database. Demo login: demo@example.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
