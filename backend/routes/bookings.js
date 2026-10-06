const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const MaternityCenter = require('../models/MaternityCenter');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const localStore = require('../utils/localStore');

// @route   POST /api/bookings
// @desc    Create a new appointment booking
// @access  Private (Logged in users)
router.post('/', protect, async (req, res) => {
    try {
        const { centerId, serviceId, bookingDate, patientPhone, notes } = req.body;

        if (!centerId || !serviceId || !bookingDate) {
            return res.status(400).json({ message: 'Center, service, and appointment date/time are required' });
        }

        const parsedDate = new Date(bookingDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid appointment date format' });
        }

        if (parsedDate < new Date()) {
            return res.status(400).json({ message: 'Appointment date must be scheduled for a future date & time' });
        }

        // Validate 10-digit phone number if provided or fallback to user phone
        const finalPhone = patientPhone || req.user.phone || '';
        const digitsOnly = String(finalPhone).replace(/\D/g, '');
        if (digitsOnly && digitsOnly.slice(-10).length !== 10) {
            return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
        }

        if (mongoose.connection.readyState === 1) {
            // Validate center exists
            const center = await MaternityCenter.findById(centerId);
            if (!center) {
                return res.status(404).json({ message: 'Selected maternity center was not found' });
            }

            // Validate service exists
            const service = await Service.findById(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Selected service was not found' });
            }

            const newBooking = await Booking.create({
                user: req.user._id,
                center: center._id,
                service: service._id,
                bookingDate: parsedDate,
                patientPhone: digitsOnly ? digitsOnly.slice(-10) : '',
                notes: notes || '',
                bookingStatus: 'Pending'
            });

            const populatedBooking = await Booking.findById(newBooking._id)
                .populate('user', 'name email phone')
                .populate('center', 'centerName address location phone email')
                .populate('service', 'serviceName price duration description');

            return res.status(201).json({
                message: 'Appointment booked successfully',
                booking: populatedBooking
            });
        }

        // Local store fallback
        const center = localStore.findCenterById(centerId);
        if (!center) {
            return res.status(404).json({ message: 'Selected maternity center was not found' });
        }

        const service = localStore.findServiceById ? localStore.findServiceById(serviceId) : { _id: serviceId, serviceName: 'Maternity Service', price: 3000, duration: '60 mins' };

        const localBooking = localStore.createBooking({
            user: { _id: req.user._id, name: req.user.name, email: req.user.email, phone: digitsOnly ? digitsOnly.slice(-10) : '' },
            center: { _id: center._id, centerName: center.centerName, address: center.address, location: center.location, phone: center.phone },
            service: service,
            bookingDate: parsedDate.toISOString(),
            patientPhone: digitsOnly ? digitsOnly.slice(-10) : '',
            notes: notes || '',
            bookingStatus: 'Pending'
        });

        return res.status(201).json({
            message: 'Appointment booked successfully',
            booking: localBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: error.message || 'Error creating appointment booking' });
    }
});

// @route   GET /api/bookings/all
// @desc    Get all bookings for admin dashboard
// @access  Private/Admin
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const bookings = await Booking.find({})
                .populate('user', 'name email phone')
                .populate('center', 'centerName address location phone email')
                .populate('service', 'serviceName price duration description')
                .sort({ createdAt: -1 });
            return res.json(bookings);
        }

        // Local store fallback
        return res.json(localStore.getAllBookings());
    } catch (error) {
        console.error('Fetch bookings error:', error);
        res.status(500).json({ message: error.message || 'Error fetching bookings' });
    }
});

// @route   GET /api/bookings/my
// @desc    Get user bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const bookings = await Booking.find({ user: req.user._id })
                .populate('center', 'centerName address location phone email')
                .populate('service', 'serviceName price duration description')
                .sort({ bookingDate: -1 });
            return res.json(bookings);
        }

        // Local store fallback
        const bookings = localStore.getAllBookings().filter(b => b.user?._id === req.user._id || b.user?.email === req.user.email);
        return res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/provider
// @desc    Get bookings specifically for the logged-in provider's center
// @access  Private (Provider / Admin)
router.get('/provider', protect, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            let center = await MaternityCenter.findOne({ email: req.user.email });
            if (!center && req.user.role === 'admin') {
                center = await MaternityCenter.findOne({});
            }
            if (!center) {
                return res.status(404).json({ message: 'No maternity center found for this provider account' });
            }

            const bookings = await Booking.find({ center: center._id })
                .populate('user', 'name email phone')
                .populate('center', 'centerName address location phone email')
                .populate('service', 'serviceName price duration description')
                .sort({ createdAt: -1 });

            return res.json(bookings);
        }

        // Local store fallback
        let center = localStore.findCenterByEmail(req.user.email);
        if (!center && req.user.role === 'admin') {
            center = localStore.getAllCenters()[0];
        }
        if (!center) {
            return res.status(404).json({ message: 'No maternity center found for this provider account' });
        }

        const bookings = localStore.getBookingsByCenterId(center._id);
        return res.json(bookings);
    } catch (error) {
        console.error('Fetch provider bookings error:', error);
        res.status(500).json({ message: error.message || 'Error fetching provider bookings' });
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Admin or Center Provider)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        if (mongoose.connection.readyState === 1) {
            const booking = await Booking.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            if (req.user.role !== 'admin') {
                const center = await MaternityCenter.findById(booking.center);
                if (!center || center.email !== req.user.email) {
                    return res.status(403).json({ message: 'Not authorized to manage appointments for this center' });
                }
            }

            booking.bookingStatus = status;
            await booking.save();

            const populated = await Booking.findById(booking._id)
                .populate('user', 'name email phone')
                .populate('center', 'centerName address location phone email')
                .populate('service', 'serviceName price duration description');

            return res.json({ message: `Booking status updated to ${status}`, booking: populated });
        }

        // Local store fallback
        const booking = localStore.findBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.role !== 'admin') {
            const center = localStore.findCenterByEmail(req.user.email);
            const bookingCenterId = booking.center?._id || booking.center;
            if (!center || (center._id !== bookingCenterId && String(center._id) !== String(bookingCenterId))) {
                return res.status(403).json({ message: 'Not authorized to manage appointments for this center' });
            }
        }

        const updated = localStore.updateBookingStatus(req.params.id, status);
        return res.json({ message: `Booking status updated to ${status}`, booking: updated });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ message: error.message || 'Error updating booking status' });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel/delete booking (Admin or Booking Owner)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const booking = await Booking.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
            }

            await Booking.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Appointment cancelled successfully' });
        }

        // Local store fallback
        const deleted = localStore.deleteBooking(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        return res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: error.message || 'Error cancelling booking' });
    }
});

module.exports = router;
