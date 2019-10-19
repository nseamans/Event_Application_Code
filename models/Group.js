const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  groupname: {
    type: String,
    required: true
  }
});

const Group = mongoose.model('Group', EventSchema);

module.exports = Group;