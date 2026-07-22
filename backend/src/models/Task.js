const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    inputText: {
      type: String,
      required: [true, 'Input text is required'],
    },
    operationType: {
      type: String,
      required: [true, 'Operation type is required'],
      enum: ['Uppercase', 'Lowercase', 'Reverse String', 'Word Count'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Running', 'Success', 'Failed'],
      default: 'Pending',
      index: true,
    },
    result: {
      type: String,
      default: null,
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: { type: String },
        level: { type: String, enum: ['INFO', 'WARN', 'ERROR'], default: 'INFO' },
      },
    ],
    executionTimeMs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for optimized querying user tasks sorted by recency
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
