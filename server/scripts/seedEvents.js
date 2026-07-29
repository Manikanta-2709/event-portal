const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(18, 0, 0, 0);
  return date;
};

const sampleOrganizer = {
  name: 'Eventra Demo Organizer',
  email: 'organizer@eventra.local',
  password: 'DemoPass123',
  phone: '9999999999',
  role: 'organizer',
};

const sampleEvents = [
  {
    title: 'Neon Nights Music Fest',
    description:
      'A high-energy evening of indie bands, DJs, food stalls, and city lights. Perfect for groups looking for a weekend concert vibe.',
    category: 'Music',
    venue: 'Phoenix Arena',
    city: 'Hyderabad',
    date: daysFromNow(12),
    time: '19:00',
    ticketPrice: 799,
    maxSeats: 300,
    availableSeats: 300,
    banner: {
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'Startup Growth Summit',
    description:
      'Founders, product builders, marketers, and investors come together for practical sessions on scaling modern startups.',
    category: 'Business',
    venue: 'T-Hub Auditorium',
    city: 'Hyderabad',
    date: daysFromNow(18),
    time: '10:00',
    ticketPrice: 1499,
    maxSeats: 180,
    availableSeats: 180,
    banner: {
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'AI & Web Dev Bootcamp',
    description:
      'Hands-on workshop covering React, APIs, AI workflows, deployment basics, and project-building habits for beginners.',
    category: 'Tech',
    venue: 'CodeCraft Labs',
    city: 'Bengaluru',
    date: daysFromNow(25),
    time: '09:30',
    ticketPrice: 999,
    maxSeats: 80,
    availableSeats: 80,
    banner: {
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'City Marathon 10K',
    description:
      'A community running event with hydration points, finisher medals, warm-up sessions, and beginner-friendly pacing groups.',
    category: 'Sports',
    venue: 'People’s Plaza',
    city: 'Hyderabad',
    date: daysFromNow(32),
    time: '06:00',
    ticketPrice: 499,
    maxSeats: 500,
    availableSeats: 500,
    banner: {
      url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'Street Food Carnival',
    description:
      'Taste regional snacks, fusion desserts, live counters, and chef-led mini demos in one delicious open-air evening.',
    category: 'Food',
    venue: 'Necklace Road Grounds',
    city: 'Hyderabad',
    date: daysFromNow(39),
    time: '17:30',
    ticketPrice: 299,
    maxSeats: 250,
    availableSeats: 250,
    banner: {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'Watercolor Weekend Workshop',
    description:
      'A relaxed art workshop for beginners with guided painting, materials included, and a take-home framed artwork.',
    category: 'Arts',
    venue: 'Kala Studio',
    city: 'Chennai',
    date: daysFromNow(46),
    time: '11:00',
    ticketPrice: 699,
    maxSeats: 45,
    availableSeats: 45,
    banner: {
      url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'Career Skills Masterclass',
    description:
      'A practical session on resumes, interview prep, LinkedIn positioning, and communication skills for students and freshers.',
    category: 'Education',
    venue: 'Learning Hub',
    city: 'Pune',
    date: daysFromNow(53),
    time: '14:00',
    ticketPrice: 0,
    maxSeats: 120,
    availableSeats: 120,
    banner: {
      url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
  {
    title: 'Open Mic Poetry Evening',
    description:
      'An intimate open mic for poets, storytellers, comics, and first-time performers. Warm audience, cozy lights, brave words.',
    category: 'Other',
    venue: 'The Little Stage Cafe',
    city: 'Mumbai',
    date: daysFromNow(60),
    time: '18:30',
    ticketPrice: 199,
    maxSeats: 70,
    availableSeats: 70,
    banner: {
      url: 'https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?auto=format&fit=crop&w=1200&q=80',
      public_id: '',
    },
  },
];

const ensureOrganizer = async () => {
  let organizer = await User.findOne({ email: sampleOrganizer.email });

  if (!organizer) {
    organizer = await User.create(sampleOrganizer);
  }

  organizer.isApproved = true;
  organizer.isBlocked = false;
  await organizer.save();

  return organizer;
};

const seedEvents = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in server/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const organizer = await ensureOrganizer();

  const results = await Promise.all(
    sampleEvents.map((event) =>
      Event.findOneAndUpdate(
        { title: event.title, organizer: organizer._id },
        { $set: { ...event, organizer: organizer._id, isApproved: true, registrationClosed: false } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  console.log(`Seeded ${results.length} sample events.`);
  console.log(`Organizer login: ${sampleOrganizer.email} / ${sampleOrganizer.password}`);
};

seedEvents()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
