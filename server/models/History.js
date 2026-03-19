const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    watchedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model('History', historySchema);
