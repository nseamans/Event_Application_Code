const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  address:{
    type: String
  },
  eventname: {
    type: String,
    required: true
  },
  type: {
    type: String
  },
  description: {
    type: String
  },
  groupname: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;