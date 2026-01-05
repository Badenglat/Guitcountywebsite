const mongoose = require('mongoose');

// User Schema (Admin)
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, sparse: true },
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    gender: String,
    location: String,
    role: { type: String, default: 'admin' },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Slide Schema
const slideSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    image: String,
    btnText: String,
    btnLink: String,
    order: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
    name: String,
    category: String,
    location: String,
    description: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Education Schema
const educationSchema = new mongoose.Schema({
    name: String,
    level: String,
    location: String,
    principal: String,
    image: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// History Schema
const historySchema = new mongoose.Schema({
    title: String,
    year: String,
    category: String,
    description: String,
    image: String,
    mediaType: { type: String, default: 'image' }, // image, video
    mediaUrl: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Healthcare Schema
const healthcareSchema = new mongoose.Schema({
    name: String,
    type: String,
    location: String,
    director: String,
    services: String,
    image: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Politician Schema
const politicianSchema = new mongoose.Schema({
    name: String,
    position: String,
    party: String,
    bio: String,
    photo: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Military Schema
const militarySchema = new mongoose.Schema({
    name: String,
    rank: String,
    branch: String,
    unit: String,
    bio: String,
    photo: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Payam Schema
const payamSchema = new mongoose.Schema({
    name: String,
    chief: String,
    population: String,
    image: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Boma Schema
const bomaSchema = new mongoose.Schema({
    name: String,
    payam: String,
    chief: String,
    population: String,
    image: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Sports Schema
const sportSchema = new mongoose.Schema({
    name: String,
    category: String,
    details: String,
    location: String,
    image: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Message Schema (Contact Form)
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, default: 'new' }, // Changed from 'read' boolean to match admin.js
    createdAt: { type: Date, default: Date.now }
});

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});

// Settings Schema
const settingSchema = new mongoose.Schema({
    siteTitle: String,
    contactEmail: String,
    contactPhone: String,
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String,
    updatedAt: { type: Date, default: Date.now }
});

// News Schema
const newsSchema = new mongoose.Schema({
    title: String,
    category: String,
    author: String,
    content: String,
    image: String,
    mediaType: { type: String, default: 'image' }, // image, video, audio
    mediaUrl: String,
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'published' },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Artist Schema
const artistSchema = new mongoose.Schema({
    fullName: String,
    stageName: String,
    category: String,
    genre: String,
    bio: String,
    achievements: String,
    payam: String,
    contact: String,
    facebook: String,
    instagram: String,
    youtube: String,
    tiktok: String,
    photo: String,
    featured: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Community Leader Schema
const leaderSchema = new mongoose.Schema({
    fullName: String,
    title: String,
    category: String,
    payam: String,
    boma: String,
    bio: String,
    phone: String,
    email: String,
    photo: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Student Schema
const studentSchema = new mongoose.Schema({
    fullName: String,
    firstName: String,
    middleName: String,
    lastName: String,
    gender: String,
    dob: Date,
    payam: String,
    photo: String,
    level: String,
    studyStatus: String,
    institution: String,
    country: String,
    field: String,
    specialization: String,
    year: String,
    enrollYear: Number,
    gradYear: Number,
    scholarship: { type: Boolean, default: false },
    scholarshipName: String,
    scholarshipType: String,
    phone: String,
    email: String,
    address: String,
    facebook: String,
    linkedIn: String,
    achievements: String,
    activities: String,
    careerGoal: String,
    memberStatus: String,
    joinDate: Date,
    notable: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Commissioner Schema
const commissionerSchema = new mongoose.Schema({
    name: String,
    message: String,
    photo: String,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model('User', userSchema),
    Slide: mongoose.model('Slide', slideSchema),
    Service: mongoose.model('Service', serviceSchema),
    Education: mongoose.model('Education', educationSchema),
    History: mongoose.model('History', historySchema),
    Healthcare: mongoose.model('Healthcare', healthcareSchema),
    Politician: mongoose.model('Politician', politicianSchema),
    Military: mongoose.model('Military', militarySchema),
    Payam: mongoose.model('Payam', payamSchema),
    Boma: mongoose.model('Boma', bomaSchema),
    Sport: mongoose.model('Sport', sportSchema),
    Message: mongoose.model('Message', messageSchema),
    Newsletter: mongoose.model('Newsletter', newsletterSchema),
    Setting: mongoose.model('Setting', settingSchema),
    News: mongoose.model('News', newsSchema),
    Artist: mongoose.model('Artist', artistSchema),
    Leader: mongoose.model('Leader', leaderSchema),
    Student: mongoose.model('Student', studentSchema),
    Commissioner: mongoose.model('Commissioner', commissionerSchema)
};
