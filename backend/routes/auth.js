const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const localStore = require('../utils/localStore');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_maternityhub';

// Register (Public registration creates standard 'user' only)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        let cleanPhone = '';
        if (phone) {
            cleanPhone = String(phone).replace(/\D/g, '');
            if (cleanPhone.length !== 10) {
                return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
            }
        }

        // Always enforce role 'user' for public registration
        const role = 'user';

        if (mongoose.connection.readyState === 1) {
            const userExists = await User.findOne({ email: email.toLowerCase().trim() });
            if (userExists) return res.status(400).json({ message: 'User with this email already exists' });

            const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, phone: cleanPhone, role });
            const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

            return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
        } else {
            // Local store fallback
            const userExists = localStore.findUserByEmail(email);
            if (userExists) return res.status(400).json({ message: 'User with this email already exists' });

            const user = await localStore.createUser({ name: name.trim(), email: email.toLowerCase().trim(), password, phone: cleanPhone, role });
            const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

            return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
});

// Register Maternity Center (Provider registration)
router.post('/register-center', async (req, res) => {
    try {
        const MaternityCenter = require('../models/MaternityCenter');
        const Service = require('../models/Service');
        const { centerName, ownerName, email, password, phone, location, address, description } = req.body;

        if (!centerName || !ownerName || !email || !password || !phone || !location || !address) {
            return res.status(400).json({ message: 'Center name, owner name, email, password, phone, location, and address are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const digitsOnly = String(phone).replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
            return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
        }

        const cleanEmail = email.toLowerCase().trim();

        if (mongoose.connection.readyState === 1) {
            const existingCenter = await MaternityCenter.findOne({ email: cleanEmail });
            const existingUser = await User.findOne({ email: cleanEmail });

            if (existingCenter || existingUser) {
                return res.status(400).json({ message: 'An account with this email address already exists' });
            }

            // Create Maternity Center with Pending status (awaits Admin approval)
            const center = await MaternityCenter.create({
                centerName: centerName.trim(),
                ownerName: ownerName.trim(),
                email: cleanEmail,
                password,
                phone: digitsOnly,
                address: address.trim(),
                location: location.trim(),
                description: description ? description.trim() : 'Certified maternity and postnatal care center.',
                status: 'Pending'
            });

            // Create User account with 'provider' role
            const user = await User.create({
                name: ownerName.trim(),
                email: cleanEmail,
                password,
                phone: digitsOnly,
                role: 'provider'
            });

            // Seed starter services for this newly registered center
            const initialServices = [
                { center: center._id, serviceName: 'Comprehensive Prenatal Consultation', description: 'Full obstetric checkup, fetal ultrasound review, and care plan.', price: 3000, duration: '60 mins', availability: true },
                { center: center._id, serviceName: 'Postnatal Lactation & Newborn Nursing', description: 'Certified nurse consultation, infant latch guidance, and newborn care.', price: 3500, duration: '60 mins', availability: true },
                { center: center._id, serviceName: 'Postpartum Recovery & Wellness Care', description: 'Physical recovery assessment and maternal wellness counseling.', price: 5000, duration: '90 mins', availability: true }
            ];
            await Service.insertMany(initialServices);

            const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

            return res.status(201).json({
                message: 'Maternity Center registered successfully. Application is pending admin approval.',
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
                center: {
                    _id: center._id,
                    centerName: center.centerName,
                    status: center.status
                }
            });
        }

        // Local store fallback
        const existingCenter = localStore.findCenterByEmail(cleanEmail);
        const existingUser = localStore.findUserByEmail(cleanEmail);
        if (existingCenter || existingUser) {
            return res.status(400).json({ message: 'An account with this email address already exists' });
        }

        const center = await localStore.createCenter({
            centerName: centerName.trim(),
            ownerName: ownerName.trim(),
            email: cleanEmail,
            password,
            phone: digitsOnly,
            address: address.trim(),
            location: location.trim(),
            description: description ? description.trim() : 'Certified maternity and postnatal care center.',
            status: 'Pending'
        });

        const user = await localStore.createUser({
            name: ownerName.trim(),
            email: cleanEmail,
            password,
            phone: digitsOnly,
            role: 'provider'
        });

        // Add starter services in local store
        localStore.addService(center._id, { serviceName: 'Comprehensive Prenatal Consultation', description: 'Full obstetric checkup and fetal ultrasound review.', price: 3000, duration: '60 mins' });
        localStore.addService(center._id, { serviceName: 'Postnatal Lactation & Newborn Nursing', description: 'Certified nurse consultation and infant latch guidance.', price: 3500, duration: '60 mins' });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        return res.status(201).json({
            message: 'Maternity Center registered successfully. Application is pending admin approval.',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
            center: {
                _id: center._id,
                centerName: center.centerName,
                status: center.status
            }
        });
    } catch (error) {
        console.error('Provider registration error:', error);
        res.status(500).json({ message: error.message || 'Maternity Center registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const MaternityCenter = require('../models/MaternityCenter');
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const cleanEmail = email.toLowerCase().trim();

        if (mongoose.connection.readyState === 1) {
            let user = await User.findOne({ email: cleanEmail });

            // Auto-provision admin account if it does not exist yet
            if (!user && cleanEmail === 'admin@maternityhub.com' && password === 'admin123') {
                user = await User.create({
                    name: 'Platform Admin',
                    email: 'admin@maternityhub.com',
                    password: 'admin123',
                    phone: '+1 (800) 555-0199',
                    role: 'admin'
                });
            }

            // If user not in User collection, check MaternityCenter collection for provider accounts
            if (!user) {
                const center = await MaternityCenter.findOne({ email: cleanEmail });
                if (center && (await center.matchPassword(password))) {
                    user = await User.create({
                        name: center.ownerName || center.centerName,
                        email: center.email,
                        password: password,
                        phone: center.phone,
                        role: 'provider'
                    });
                }
            }

            if (user && (await user.matchPassword(password))) {
                // Find associated center if provider
                let centerInfo = null;
                if (user.role === 'provider') {
                    const centerDoc = await MaternityCenter.findOne({ email: cleanEmail });
                    if (centerDoc) {
                        centerInfo = { _id: centerDoc._id, centerName: centerDoc.centerName, status: centerDoc.status };
                    }
                }

                const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
                return res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token, center: centerInfo });
            }
        }

        // Local store fallback
        let localUser = localStore.findUserByEmail(cleanEmail);
        
        // Check if center exists in local store
        if (!localUser) {
            const localCenter = localStore.findCenterByEmail(cleanEmail);
            if (localCenter && (await localStore.verifyUserPassword(localCenter, password))) {
                localUser = await localStore.createUser({
                    name: localCenter.ownerName,
                    email: localCenter.email,
                    password: password,
                    phone: localCenter.phone,
                    role: 'provider'
                });
            }
        }

        if (localUser && (await localStore.verifyUserPassword(localUser, password))) {
            let centerInfo = null;
            if (localUser.role === 'provider') {
                const localCenter = localStore.findCenterByEmail(cleanEmail);
                if (localCenter) {
                    centerInfo = { _id: localCenter._id, centerName: localCenter.centerName, status: localCenter.status };
                }
            }
            const token = jwt.sign({ id: localUser._id, role: localUser.role, email: localUser.email }, JWT_SECRET, { expiresIn: '30d' });
            return res.json({ _id: localUser._id, name: localUser.name, email: localUser.email, role: localUser.role, token, center: centerInfo });
        }

        return res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
});

// Current User Profile / Me
router.get('/me', async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            if (mongoose.connection.readyState === 1) {
                const user = await User.findById(decoded.id).select('-password');
                if (!user) return res.status(404).json({ message: 'User not found' });

                const MaternityCenter = require('../models/MaternityCenter');
                let centerInfo = null;
                if (user.role === 'provider') {
                    const centerDoc = await MaternityCenter.findOne({ email: user.email });
                    if (centerDoc) {
                        centerInfo = { _id: centerDoc._id, centerName: centerDoc.centerName, status: centerDoc.status };
                    }
                }

                return res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, center: centerInfo });
            }

            // Local store
            const localUser = localStore.findUserById(decoded.id);
            if (!localUser) return res.status(404).json({ message: 'User not found' });
            const { password, ...safeUser } = localUser;
            let centerInfo = null;
            if (safeUser.role === 'provider') {
                const localCenter = localStore.findCenterByEmail(safeUser.email);
                if (localCenter) {
                    centerInfo = { _id: localCenter._id, centerName: localCenter.centerName, status: localCenter.status };
                }
            }
            return res.json({ ...safeUser, center: centerInfo });
        }
        return res.status(401).json({ message: 'Not authorized, no token' });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
