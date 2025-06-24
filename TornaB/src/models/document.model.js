import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false,
    index: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: { /* same as before */ },
  content: { /* same as before */ },
  wordCount: { /* same as before */ },
  status: { /* same as before */ },
  notes: { /* same as before */ },
  history: [ /* same as before */ ],
  shareableLink: { /* same as before */ },
}, {
  timestamps: true,
});

// post-save middleware unchanged
// post-delete middleware unchanged

export const Document = mongoose.model('Document', documentSchema);
