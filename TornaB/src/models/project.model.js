import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for efficient lookup by owner
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters long.'],
      maxlength: [100, 'Project name cannot exceed 100 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'InProgress', 'Completed', 'Archived'],
      default: 'Draft',
    },
    targetWordCount: {
      type: Number,
      min: [0, 'Target word count cannot be negative.'],
      default: 0,
    },
    currentWordCount: {
      type: Number,
      min: [0, 'Current word count cannot be negative.'],
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      // Custom validator to ensure dueDate is after startDate if both are present
      validate: {
        validator: function(v) {
          if (this.startDate && v) {
            return v >= this.startDate;
          }
          return true;
        },
        message: 'Due date must be after or equal to the start date.',
      },
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters.'],
      },
    ],
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

export const Project = mongoose.model('Project', projectSchema);