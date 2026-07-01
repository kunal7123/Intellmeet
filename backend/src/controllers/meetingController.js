const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');

// Meeting banao
const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;

    const meeting = await Meeting.create({
      title,
      host: req.user._id,
      roomId: uuidv4(),
      participants: [req.user._id]
    });

    res.status(201).json({
      message: 'Meeting ban gayi! ✅',
      meeting
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Saari meetings lao
const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { host: req.user._id },
        { participants: req.user._id }
      ]
    }).populate('host', 'name email').sort({ createdAt: -1 });

    res.json({ meetings });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Single meeting lao
const getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('host', 'name email')
      .populate('participants', 'name email');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting nahi mili!' });
    }

    res.json({ meeting });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Meeting join karo
const joinMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ roomId: req.params.roomId });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting nahi mili! Room ID check karo.' });
    }

    if (meeting.status === 'completed') {
      return res.status(400).json({ message: 'Ye meeting khatam ho chuki hai!' });
    }

    // Agar already participant nahi hai toh add karo
    if (!meeting.participants.includes(req.user._id)) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }

    res.json({
      message: 'Meeting join ho gayi! ✅',
      meeting
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Meeting status update karo (live/completed)
const updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting nahi mili!' });
    }

    // Sirf host update kar sakta hai
    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sirf host status update kar sakta hai!' });
    }

    meeting.status = status;
    await meeting.save();

    res.json({ message: 'Status update ho gaya! ✅', meeting });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// AI Summary save karo
const saveSummary = async (req, res) => {
  try {
    const { transcript, aiSummary, actionItems } = req.body;

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting nahi mili!' });
    }

    meeting.transcript = transcript;
    meeting.aiSummary = aiSummary;
    meeting.actionItems = actionItems;
    await meeting.save();

    res.json({ 
      message: 'Summary save ho gayi! ✅', 
      meeting 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { createMeeting, getMeetings, getMeeting, joinMeeting, updateMeetingStatus, saveSummary };
