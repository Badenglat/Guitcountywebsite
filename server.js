const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const {
    User, Slide, Service, Education, History, Healthcare, Politician,
    Military, Payam, Boma, Sport, Message, Newsletter, Setting,
    News, Artist, Leader, Student, Commissioner
} = require('./models');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const multer = require('multer');

// Configure Multer for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for media
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/') ||
            file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images, videos, and audio files are allowed'));
        }
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/'))); // Serve static files from root
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploads directory

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/guit_county', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Generic CRUD Helper
const createCrudRoutes = (router, Model, resourceName) => {
    // GET ALL
    // GET ALL
    router.get(`/${resourceName}`, async (req, res) => {
        try {
            const items = await Model.find().sort({ updatedAt: -1 });
            res.json(items.map(item => {
                const doc = item.toObject();
                doc.id = doc._id;
                delete doc._id;
                delete doc.__v;
                return doc;
            }));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // GET ONE
    router.get(`/${resourceName}/:id`, async (req, res) => {
        try {
            const item = await Model.findById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Not Found' });
            res.json(item);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // CREATE
    router.post(`/${resourceName}`, async (req, res) => {
        try {
            const newItem = new Model(req.body);
            const savedItem = await newItem.save();
            res.status(201).json(savedItem);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // UPDATE
    router.put(`/${resourceName}/:id`, async (req, res) => {
        try {
            req.body.updatedAt = new Date();
            const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedItem);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // DELETE
    router.delete(`/${resourceName}/:id`, async (req, res) => {
        try {
            await Model.findByIdAndDelete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

const router = express.Router();

// Register Routes
createCrudRoutes(router, Slide, 'slides');
createCrudRoutes(router, Service, 'services');
createCrudRoutes(router, Education, 'education');
createCrudRoutes(router, History, 'history');
createCrudRoutes(router, Healthcare, 'healthcare');
createCrudRoutes(router, Politician, 'politicians');
createCrudRoutes(router, Military, 'military');
createCrudRoutes(router, Payam, 'payams');
createCrudRoutes(router, Boma, 'bomas');
createCrudRoutes(router, Sport, 'sports');
createCrudRoutes(router, Message, 'messages');
createCrudRoutes(router, Newsletter, 'newsletter');
createCrudRoutes(router, User, 'users');
createCrudRoutes(router, News, 'news');
createCrudRoutes(router, Artist, 'artists');
createCrudRoutes(router, Leader, 'leaders');
createCrudRoutes(router, Student, 'students');
createCrudRoutes(router, Commissioner, 'commissioner');

// Settings (Special case: Singleton)
router.get('/settings', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = await new Setting({}).save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/settings', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        settings.updatedAt = new Date();
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Consolidated Public Data API
router.get('/public-data', async (req, res) => {
    try {
        const data = {
            news: await News.find({ status: 'published' }).sort({ date: -1 }),
            services: await Service.find({ status: 'active' }).sort({ createdAt: -1 }),
            education: await Education.find({ status: 'active' }),
            healthcare: await Healthcare.find({ status: 'active' }),
            politicians: await Politician.find({ status: 'active' }),
            military: await Military.find({ status: 'active' }),
            payams: await Payam.find({ status: 'active' }),
            bomas: await Boma.find({ status: 'active' }),
            sports: await Sport.find({ status: 'active' }),
            artists: await Artist.find({ status: 'active' }),
            leaders: await Leader.find({ status: 'active' }),
            students: await Student.find({ status: 'active' }),
            slides: await Slide.find({ status: 'active' }).sort({ order: 1 }),
            history: await History.find({}).sort({ year: -1 }),
            settings: await Setting.findOne(),
            // Get the most recently updated commissioner profile to handle potential duplicates
            commissioner: await Commissioner.findOne().sort({ updatedAt: -1 }),
            // Calculated or additional stats
            stats: {
                totalStudents: await Student.countDocuments({ status: 'active' }),
                totalNews: await News.countDocuments({ status: 'published' })
            }
        };
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload API with error handling
router.post('/upload', (req, res) => {
    console.log('📬 Upload request received');
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('❌ Multer Error:', err.message);
            // A Multer error occurred when uploading.
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('❌ Upload Error:', err.message);
            // An unknown error occurred when uploading.
            return res.status(500).json({ error: `Server error: ${err.message}` });
        }

        // Everything went fine.
        if (!req.file) {
            console.warn('⚠️ No file selected in request');
            return res.status(400).json({ error: 'No file selected' });
        }

        const filePath = `/uploads/${req.file.filename}`;
        console.log('✅ File uploaded successfully:', filePath);
        res.json({ url: filePath });
    });
});

// Like News Post
router.post('/news/:id/like', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News not found' });

        news.likes = (news.likes || 0) + 1;
        await news.save();

        res.json({ success: true, likes: news.likes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stats API
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            services: await Service.countDocuments(),
            education: await Education.countDocuments(),
            healthcare: await Healthcare.countDocuments(),
            politicians: await Politician.countDocuments(),
            news: await News.countDocuments(),
            artists: await Artist.countDocuments(),
            leaders: await Leader.countDocuments(),
            students: await Student.countDocuments(),
            users: await User.countDocuments(),
            slides: await Slide.countDocuments(),
            payams: await Payam.countDocuments(),
            bomas: await Boma.countDocuments(),
            sports: await Sport.countDocuments(),
            military: await Military.countDocuments(),
            history: await History.countDocuments(),
            messages: await Message.countDocuments(),
            commissioner: await Commissioner.countDocuments(),
            unreadMessages: await Message.countDocuments({ status: { $ne: 'read' } }),
            publishedNews: await News.countDocuments({ status: 'published' })
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auth - Register
router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, gender, location } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const newUser = new User({
            username: email.split('@')[0], // Default username from email
            email,
            password, // NOTE: In production, use bcrypt to hash!
            firstName,
            lastName,
            phone,
            gender,
            location
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Auth - Login
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for: ${username}`);

        // Find by username OR email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ],
            password: password
        });

        if (user) {
            console.log('Login successful');
            res.json({
                success: true,
                user: {
                    username: user.username || user.firstName,
                    role: user.role,
                    id: user._id
                }
            });
        } else {
            console.log('Invalid credentials');
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.use('/api', router);

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initial Seed - Create default admin if none exists
async function seedAdmin() {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount === 0) {
            const admin = new User({
                username: 'admin',
                email: 'admin@guitcounty.gov',
                password: 'admin123',
                firstName: 'System',
                lastName: 'Administrator',
                role: 'admin'
            });
            await admin.save();
            console.log('🛡️ Default admin created: admin / admin123');
        }
    } catch (err) {
        console.error('Seed Error:', err);
    }
}

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await seedAdmin();
});
