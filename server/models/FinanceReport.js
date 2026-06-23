const mongoose = require('mongoose');

const financeReportSchema = new mongoose.Schema({
  ngoId: {
    type: String,
    required: true,
    ref: 'User'
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  rows: [{
    particulars: {
      type: String,
      required: true
    },
    expense: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  bills: [] // Array of Mixed to support both base64 strings and {url, name, fileType} objects
}, {
  timestamps: true
});

module.exports = mongoose.model('FinanceReport', financeReportSchema);
