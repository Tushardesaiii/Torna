import mongoose, { Schema } from 'mongoose';

const pageSchema = new Schema({
  id: { type: String, required: true }, // e.g., 'page-123456'
  title: { type: String, default: 'Untitled Page' },
  content: { type: String, default: '' }, // HTML string
});

const noteSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const locationSchema = new Schema({
  name: { type: String, required: true },
});

const characterSchema = new Schema({
  name: { type: String, required: true },
});

const loreSchema = new Schema({
  entry: { type: String, required: true },
});

const documentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    pages: {
      type: [pageSchema],
      default: [],
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['Draft', 'In Progress', 'Published'],
      default: 'Draft',
    },

    notes: {
      type: [noteSchema],
      default: [],
    },

    worldBuilding: {
      locations: { type: [locationSchema], default: [] },
      characters: { type: [characterSchema], default: [] },
      loreWiki: { type: [loreSchema], default: [] },
    },

    history: [
      {
        content: { type: String },
        wordCount: { type: Number },
        savedAt: { type: Date, default: Date.now },
      },
    ],

    shareableLink: {
      type: String,
      unique: true,
      sparse: true,
    },

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
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.model('Document', documentSchema);
