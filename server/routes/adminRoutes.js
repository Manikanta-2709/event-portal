const express = require('express');
const {
  getStats,
  getUsers,
  toggleBlockUser,
  approveOrganizer,
  getAllEvents,
  removeEvent,
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/organizers/:id/approve', approveOrganizer);
router.get('/events', getAllEvents);
router.delete('/events/:id', removeEvent);

module.exports = router;
