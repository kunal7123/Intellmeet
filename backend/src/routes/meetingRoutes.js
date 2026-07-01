const express = require('express');
const router = express.Router();
const { createMeeting, getMeetings, getMeeting, joinMeeting, updateMeetingStatus, saveSummary } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');


router.post('/create', protect, createMeeting);
router.get('/', protect, getMeetings);
router.get('/:id', protect, getMeeting);
router.post('/join/:roomId', protect, joinMeeting);
router.put('/:id/status', protect, updateMeetingStatus);
router.put('/:id/summary', protect, saveSummary);

module.exports = router;