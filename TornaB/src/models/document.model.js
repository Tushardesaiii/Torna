import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true, // Index for efficient lookup by project
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for efficient lookup by owner
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Document title must be at least 3 characters long.'],
      maxlength: [200, 'Document title cannot exceed 200 characters.'],
    },
    content: {
      type: String,
      default: '',
      // No max length for content as it can be very long
    },
    wordCount: {
      type: Number,
      min: [0, 'Word count cannot be negative.'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Editing', 'Review', 'Final'],
      default: 'Draft',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
      default: '',
    },
    // Optional: for future version control
    history: [
      {
        content: { type: String },
        wordCount: { type: Number, default: 0 },
        savedAt: { type: Date, default: Date.now },
      },
    ],
    shareableLink: {
      type: String,
      unique: true, // Ensure unique shareable links
      sparse: true, // Allows null values, only unique if a value is present
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Middleware to update project's currentWordCount when a document is saved or deleted
documentSchema.post('save', async function (doc, next) {
  // `this` refers to the document being saved
  if (doc.isModified('wordCount') || doc.isNew) {
    await doc.populate('project'); // Populate the project reference
    const project = doc.project;
    if (project) {
      // Recalculate total word count for the project
      const documentsInProject = await mongoose.model('Document').find({ project: project._id });
      project.currentWordCount = documentsInProject.reduce((sum, d) => sum + d.wordCount, 0);
      // Mark as modified if the array itself was altered, not just its contents
      project.markModified('documents'); 
      await project.save();
    }
  }
  next();
});

documentSchema.post('deleteOne', { document: true, query: false }, async function (doc, next) {
    // `this` refers to the document that was deleted
    await doc.model('Project').findByIdAndUpdate(
        doc.project,
        {
            $pull: { documents: doc._id }, // Remove reference from project's documents array
            $inc: { currentWordCount: -doc.wordCount } // Decrement project's word count
        },
        { new: true }
    );
    next();
});

export const Document = mongoose.model('Document', documentSchema);