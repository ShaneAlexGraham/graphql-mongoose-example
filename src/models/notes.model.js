const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  name: {
    type: String,
    text: true
  },
  body: {
    type: String,
    text: true
  },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'NotesCollection' }
});

notesSchema.index(
    {
        name: 'text',
        body: 'text'
    },
    {
        name: 'NotesTextIndex',
        default_language: 'english',
        weights: {
            name: 5,
            body: 10,
        },
    }
);

const Notes = mongoose.model('Notes', notesSchema);

exports.Notes = Notes;