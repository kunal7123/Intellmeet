const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  roomId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled'
  },
  transcript: {
    type: String,
    default: ''
  },
  aiSummary: {
    type: String,
    default: ''
  },
  actionItems: [{
    task: String,
    assignee: String,
    done: {
      type: Boolean,
      default: false
    }
  }],
  recording: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);