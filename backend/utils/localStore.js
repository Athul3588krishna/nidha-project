const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'local_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate simple 24-char hex ID compatible with Mongo ObjectId
const generateId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return timestamp + random;
};

// Initial Seed Data
const getInitialData = () => {
    const adminId = generateId();
    const providerId = generateId();
    const patientId = generateId();

    const blossomCenterId = generateId();
    const stJudeCenterId = generateId();
    const serenityCenterId = generateId();
    const graceCenterId = generateId();
    const luminaCenterId = generateId();
    const nurtureCenterId = generateId();
    const hopeHavenCenterId = generateId();

    const salt = bcrypt.genSaltSync(10);

    return {
        users: [
            {
                _id: adminId,
                name: 'Platform Admin',
                email: 'admin@maternityhub.com',
                password: bcrypt.hashSync('admin123', salt),
                phone: '+1 (800) 555-0199',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                _id: providerId,
                name: 'Dr. Sarah Jenkins',
                email: 'provider@blossom.com',
                password: bcrypt.hashSync('provider123', salt),
                phone: '+1 (415) 555-0192',
                role: 'provider',
                createdAt: new Date().toISOString()
            },
            {
                _id: patientId,
                name: 'Emily Watson',
                email: 'patient@gmail.com',
                password: bcrypt.hashSync('patient123', salt),
                phone: '+1 (555) 234-5678',
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ],
        centers: [
            {
                _id: blossomCenterId,
                centerName: 'Blossom Maternity Center',
                ownerName: 'Dr. Sarah Jenkins',
                email: 'provider@blossom.com',
                password: bcrypt.hashSync('provider123', salt),
                phone: '+1 (415) 555-0192',
                address: '450 Healthcare Ave, Suite 200',
                location: 'San Francisco, CA',
                description: 'Luxury natural birth suites, 24/7 obstetricians, water birth tubs, and postpartum confinement care.',
                status: 'Approved',
                rating: 4.9,
                reviewsCount: 12,
                createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
            },
            {
                _id: stJudeCenterId,
                centerName: 'St. Jude Postnatal Care',
                ownerName: 'Dr. Robert Vance',
                email: 'care@stjude-infant.care',
                password: bcrypt.hashSync('password123', salt),
                phone: '+1 (312) 555-0921',
                address: '1200 Hope Blvd',
                location: 'Chicago, IL',
                description: 'Level III NICU, comprehensive high-risk pregnancy management, fetal cardiology & ultrasound.',
                status: 'Approved',
                rating: 4.8,
                reviewsCount: 8,
                createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
            },
            {
                _id: serenityCenterId,
                centerName: 'Serenity Maternity Center',
                ownerName: 'Elena Rostova',
                email: 'hello@serenityhaven.com',
                password: bcrypt.hashSync('password123', salt),
                phone: '+1 (512) 555-7732',
                address: '44 Wellness Way',
                location: 'Austin, TX',
                description: 'Postpartum nursing retreat, lactation consultants, maternal mental wellness counseling, newborn nutrition.',
                status: 'Approved',
                rating: 5.0,
                reviewsCount: 15,
                createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
            },
            {
                _id: graceCenterId,
                centerName: 'Grace Postnatal Care',
                ownerName: 'Dr. Michael Chen',
                email: 'info@gracefamily.nyc',
                password: bcrypt.hashSync('password123', salt),
                phone: '+1 (212) 555-8891',
                address: '888 Madison Ave',
                location: 'New York, NY',
                description: 'Comprehensive prenatal diagnostics, painless epidural labor suites, and 24/7 emergency OB/GYN response.',
                status: 'Approved',
                rating: 4.7,
                reviewsCount: 9,
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
            },
            {
                _id: luminaCenterId,
                centerName: 'Lumina Maternity Center',
                ownerName: 'Sophia Martinez',
                email: 'contact@luminawomens.com',
                password: bcrypt.hashSync('password123', salt),
                phone: '+1 (310) 555-1200',
                address: '7700 Sunset Blvd',
                location: 'Los Angeles, CA',
                description: 'Premium maternal care focusing on holistic wellness, customized birth plans, and advanced prenatal genetics.',
                status: 'Approved',
                rating: 4.9,
                reviewsCount: 11,
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
            },
            {
                _id: nurtureCenterId,
                centerName: 'Nurture Postnatal Care',
                ownerName: 'Rachel Green',
                email: 'hello@nurturecare.com',
                password: bcrypt.hashSync('password123', salt),
                phone: '+1 (206) 555-4309',
                address: '204 Pine St',
                location: 'Seattle, WA',
                description: 'Cozy, home-like birthing environment with highly experienced midwives and comprehensive doula support.',
                status: 'Approved',
                rating: 4.8,
                reviewsCount: 6,
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
                _id: hopeHavenCenterId,
                centerName: 'Hope Haven Birthing Suites',
                ownerName: 'Dr. James Wilson',
                email: 'contact@hopehaven.org',
                password: bcrypt.hashSync('password123', salt),
                phone: '+1 (404) 555-3321',
                address: '500 Peachtree St',
                location: 'Atlanta, GA',
                description: 'Specialized fetal medicine, water birth delivery, and newborn intensive care unit.',
                status: 'Pending',
                rating: 4.8,
                reviewsCount: 0,
                createdAt: new Date().toISOString()
            }
        ],
        services: [
            {
                _id: generateId(),
                center: blossomCenterId,
                serviceName: 'Postnatal Lactation & Newborn Nursing',
                description: 'Certified lactation nurse consultation, infant attachment guidance.',
                price: 3500,
                duration: '60 mins',
                availability: true
            },
            {
                _id: generateId(),
                center: blossomCenterId,
                serviceName: 'Postpartum Recovery & Wellness Care',
                description: 'Physical recovery assistance, mental wellness check, and nutrition plan.',
                price: 5000,
                duration: '90 mins',
                availability: true
            },
            {
                _id: generateId(),
                center: blossomCenterId,
                serviceName: 'Prenatal Health & Sonography Package',
                description: 'Full fetal anatomy scan, maternal health assessment, and ultrasound recording.',
                price: 2500,
                duration: '45 mins',
                availability: true
            },
            {
                _id: generateId(),
                center: blossomCenterId,
                serviceName: 'Luxury Water Birth Delivery Suite',
                description: 'Private birthing tub, personal midwife, obstetrician on standby, and care kit.',
                price: 45000,
                duration: '24 Hours Care',
                availability: true
            }
        ],
        reviews: [
            {
                _id: generateId(),
                center: blossomCenterId,
                user: { _id: patientId, name: 'Emily Watson' },
                rating: 5,
                comment: 'The birth suite was extraordinarily peaceful and the nurses were so compassionate!'
            }
        ],
        bookings: [
            {
                _id: generateId(),
                user: { _id: patientId, name: 'Emily Watson', email: 'patient@gmail.com', phone: '+1 (555) 234-5678' },
                center: { _id: blossomCenterId, centerName: 'Blossom Maternity Center', address: '450 Healthcare Ave, Suite 200', location: 'San Francisco, CA' },
                service: { serviceName: 'Postnatal Lactation & Newborn Nursing', price: 3500, duration: '60 mins' },
                bookingDate: new Date(Date.now() + 86400000 * 3).toISOString(),
                bookingStatus: 'Accepted',
                createdAt: new Date().toISOString()
            }
        ]
    };
};

class LocalStore {
    constructor() {
        this.data = null;
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                this.data = JSON.parse(raw);
            } else {
                this.data = getInitialData();
                this.save();
            }
        } catch (e) {
            console.error('Error loading local DB, initializing default:', e.message);
            this.data = getInitialData();
            this.save();
        }
    }

    save() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (e) {
            console.error('Error saving local DB:', e.message);
        }
    }

    // User Operations
    findUserByEmail(email) {
        if (!email) return null;
        return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    findUserById(id) {
        return this.data.users.find(u => u._id === id || String(u._id) === String(id)) || null;
    }

    async createUser(userData) {
        const existing = this.findUserByEmail(userData.email);
        if (existing) return existing;

        let hashedPassword = userData.password;
        if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(userData.password, salt);
        }

        const newUser = {
            _id: generateId(),
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone || '',
            role: userData.role || 'user',
            createdAt: new Date().toISOString()
        };

        this.data.users.push(newUser);
        this.save();
        return newUser;
    }

    async verifyUserPassword(user, enteredPassword) {
        if (!user || !user.password) return false;
        return await bcrypt.compare(enteredPassword, user.password);
    }

    // Center Operations
    findCenters({ search, location } = {}) {
        let results = [...this.data.centers];

        if (location && location !== 'All Locations') {
            results = results.filter(c => c.location && c.location.toLowerCase().includes(location.toLowerCase()));
        }

        if (search) {
            const s = search.toLowerCase();
            results = results.filter(c =>
                (c.centerName && c.centerName.toLowerCase().includes(s)) ||
                (c.description && c.description.toLowerCase().includes(s)) ||
                (c.address && c.address.toLowerCase().includes(s)) ||
                (c.location && c.location.toLowerCase().includes(s))
            );
        }

        return results;
    }

    getAllCenters() {
        return [...this.data.centers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    findCenterById(id) {
        const center = this.data.centers.find(c => c._id === id || String(c._id) === String(id));
        if (!center) return null;

        const services = this.data.services.filter(s => s.center === center._id || String(s.center) === String(center._id));
        const reviews = this.data.reviews.filter(r => r.center === center._id || String(r.center) === String(center._id));

        return {
            ...center,
            services,
            reviews
        };
    }

    findCenterByEmail(email) {
        if (!email) return null;
        return this.data.centers.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
    }

    async createCenter(centerData) {
        const _id = generateId();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(centerData.password || 'provider123', salt);

        const newCenter = {
            _id,
            centerName: centerData.centerName,
            ownerName: centerData.ownerName,
            email: centerData.email,
            password: hashedPassword,
            phone: centerData.phone,
            address: centerData.address,
            location: centerData.location,
            description: centerData.description || 'Certified maternity care center.',
            status: centerData.status || 'Approved',
            rating: 4.9,
            reviewsCount: 0,
            createdAt: new Date().toISOString()
        };

        this.data.centers.unshift(newCenter);
        this.save();
        return newCenter;
    }

    updateCenterStatus(id, status) {
        const center = this.data.centers.find(c => c._id === id || String(c._id) === String(id));
        if (!center) return null;
        center.status = status;
        this.save();
        return center;
    }

    updateCenter(id, updateData) {
        const center = this.data.centers.find(c => c._id === id || String(c._id) === String(id));
        if (!center) return null;

        if (updateData.centerName) center.centerName = updateData.centerName;
        if (updateData.phone) center.phone = updateData.phone;
        if (updateData.address) center.address = updateData.address;
        if (updateData.location) center.location = updateData.location;
        if (updateData.description) center.description = updateData.description;

        this.save();
        return center;
    }

    deleteCenter(id) {
        const centerIndex = this.data.centers.findIndex(c => c._id === id || String(c._id) === String(id));
        if (centerIndex === -1) return false;

        this.data.centers.splice(centerIndex, 1);
        this.data.services = this.data.services.filter(s => s.center !== id && String(s.center) !== String(id));
        this.save();
        return true;
    }

    // Services
    getServicesByCenterId(centerId) {
        return this.data.services.filter(s => s.center === centerId || String(s.center) === String(centerId));
    }

    addService(centerId, serviceData) {
        const id = generateId();
        const newService = {
            _id: id,
            center: centerId,
            serviceName: serviceData.serviceName,
            description: serviceData.description || '',
            price: Number(serviceData.price) || 0,
            duration: serviceData.duration || '60 mins',
            availability: serviceData.availability !== false
        };
        this.data.services.push(newService);
        this.save();
        return newService;
    }

    updateService(serviceId, updateData) {
        const service = this.data.services.find(s => s._id === serviceId || String(s._id) === String(serviceId));
        if (!service) return null;
        if (updateData.serviceName) service.serviceName = updateData.serviceName;
        if (updateData.description !== undefined) service.description = updateData.description;
        if (updateData.price !== undefined) service.price = Number(updateData.price);
        if (updateData.duration) service.duration = updateData.duration;
        if (updateData.availability !== undefined) service.availability = updateData.availability;
        this.save();
        return service;
    }

    deleteService(serviceId) {
        const index = this.data.services.findIndex(s => s._id === serviceId || String(s._id) === String(serviceId));
        if (index !== -1) {
            this.data.services.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    // Bookings
    getAllBookings() {
        return [...this.data.bookings].sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    }

    getBookingsByCenterId(centerId) {
        return this.data.bookings
            .filter(b => (b.center?._id === centerId || String(b.center?._id) === String(centerId) || b.center === centerId || String(b.center) === String(centerId)))
            .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    }

    findBookingById(id) {
        return this.data.bookings.find(b => b._id === id || String(b._id) === String(id)) || null;
    }

    createBooking(bookingData) {
        const id = generateId();
        const newBooking = {
            _id: id,
            user: bookingData.user,
            center: bookingData.center,
            service: bookingData.service,
            bookingDate: bookingData.bookingDate,
            bookingStatus: bookingData.bookingStatus || 'Pending',
            patientPhone: bookingData.patientPhone || '',
            notes: bookingData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.data.bookings.push(newBooking);
        this.save();
        return newBooking;
    }

    updateBookingStatus(id, status) {
        const booking = this.data.bookings.find(b => b._id === id || String(b._id) === String(id));
        if (booking) {
            booking.bookingStatus = status;
            booking.updatedAt = new Date().toISOString();
            this.save();
        }
        return booking;
    }

    deleteBooking(id) {
        const index = this.data.bookings.findIndex(b => b._id === id || String(b._id) === String(id));
        if (index !== -1) {
            this.data.bookings.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
}

const storeInstance = new LocalStore();
module.exports = storeInstance;
