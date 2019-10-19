const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Group = require('../models/Group');
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth');
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

/** dashboard
 *  The main menu accessed after user authentication. 
 */
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  Event.find({
      email: req.user.email
    }).sort({
      date: 'asc'
    })
    .then(events => {
      res.render('dashboard', {
        user: req.user,
        events: events
      })
    })
    .catch(err => console.log(err));
});

/** eventadd 
 *  Sends the user to the event add route
 */
router.get('/eventadd', ensureAuthenticated, (req, res) => {
  res.render('eventadd', {
    user: req.user
  })
});

/** eventedit
 *  Finds an event by id and sendsthe event to the edit route.
 */
router.post('/eventedit', ensureAuthenticated, (req, res) => {
  Event.findById(req.body.eventid)
    .then(event => {
      res.render('eventedit', {
        user: req.user,
        event: event
      })
    })
    .catch(err => console.log(err));
});

/** groupadd 
 *  
 */
router.post('/groupadd', (req, res) => {
  const {
    email,
    groupname
  } = req.body;
  let errors = [];

  if (!email || !groupname) {
    errors.push({
      msg: 'Please enter all fields'
    });
    console.log("A field is empty");
  }
  if (errors.length > 0) {
    //res.redirect('/dashboard');
  } else {
    Group.findOne({
        email: req.body.email,
        groupname: groupname
      })
      .then(groups => {
        if (groups) {
          console.log('This record Exists ' + groups.groupname);
        } else {

          const newGroup = new Group({
            email,
            groupname
          });
          newGroup.save()
            .then(group => {
              passReqToCallback: true;
              res.redirect('/dashboard');
            })
            .catch(err => console.log(err));
        }
      });
  }
});

/** groupdelete
 *  Deletes a group avalible to the user
 */
router.post('/groupdelete', ensureAuthenticated, (req, res) => {

  Group.deleteOne({
      email: req.body.email,
      groupname: req.body.groupname
    })
    .then(groups => {
      Event.find({
          email: req.user.email
        }).sort({
          date: 'asc'
        })
        .then(events => {
          res.render('dashboard', {
            user: req.user,
            events: events
          })
        })
        .catch(err => console.log(err));
    }).catch(err => console.log(err));
});

/** eventadd
 *  Validates data sent through the eventadd screen and sends the data to 
 *  the mongo database if the validation passes.
 */
router.post('/eventadd', (req, res) => {
  const {
    email,
    eventname,
    address,
    type,
    description,
    groupname,
    date
  } = req.body;
  let errors = [];
  if (!email || !eventname || !type || !description || !groupname || !date) {
    errors.push({
      msg: 'Please enter all fields'
    });
    console.log("A field is empty");
  }

  if (description.length > 240) {
    errors.push({
      msg: 'the description can only be up to 240 chars'
    });
  }

  if (errors.length > 0) {
    //res.redirect('/dashboard');
  } else {

    const newEvent = new Event({
      email,
      address,
      eventname,
      type,
      description,
      groupname,
      date
    });

    newEvent.save()
      .then(event => {
        passReqToCallback: true
        res.redirect('/dashboard');
      })
      .catch(err => console.log(err));

  }
});

/** updateEvent
 *  Finds a record by ID and passes the the record to an eventedit route. 
 *  If the event cannot be found or there is another error then the dashboard is 
 *  sent back.
 */
router.post('/updateEvent', (req, res) => {
  Event.findOneAndUpdate(req.body.id, req.body, {
    new: true,
    useFindAndModify: false
  }, (err, event) => {
    if (err) {
      Event.findById(req.body.id)
        .then(event => {
          res.render('eventedit', {
            user: req.user,
            event: event
          })
        });

    } else {
      Event.find({
          email: req.user.email
        }).sort({
          date: 'asc'
        })
        .then(events => {
          console.log(err);
          res.render('dashboard', {
            user: req.user,
            events: events
          })
        });
    }
  });
});

/** eventdelete
 *  Deletes a record by id. If there is an error, the error is advertised in 
 *  the console.
 */
router.post('/eventdelete', ensureAuthenticated, (req, res) => {

  Event.findByIdAndRemove(req.body.eventid)
    .then(event => {
      Event.find({
          email: req.user.email
        }).sort({
          date: 'asc'
        })
        .then(events => {
          res.render('dashboard', {
            user: req.user,
            events: events
          })
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

/** typesearch
 *  A route that allows users to search the database by 
 *  event type. 
 */
router.post('/typesearch', ensureAuthenticated, (req, res) => {
  let eventType = req.body.eventtype;
  let eventOrder = req.body.dateOrder;

  Event.find({
      email: req.user.email,
      type: eventType
    }).sort({
      date: eventOrder
    })
    .then(events => {

      Group.find({
          email: req.user.email
        })
        .then(groups => {

          let groupResults = new Array();
          for (i = 0; i < groups.length; i++) {
            groupResults.push(groups[i].groupname);
          }

          let userGroups = new Array();
          let userSet = new Set(groups);
          for (i = 0; i < groupResults.length; i++) {

            let groupSetHas = userSet.has(groupResults[i]);
            if (groupSetHas === false) {
              userGroups.push(groupResults[i]);
              userSet.add(groupResults[i]);
            }
          }

          let searchGroups = new Array();

          for (i = 0; i < groupResults.length; i++) {
            searchGroups[i] = groups[i].groupname;
            console.log(searchGroups[i]);
          }

          res.render('viewevents', {
            user: req.user,
            events: events,
            groups: userGroups,
            searchGroups: searchGroups
          })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

/** groupsearch
 *  A route that allows users to search the database by group
 */
router.post('/groupsearch', ensureAuthenticated, (req, res) => {
  let sentGroupName = req.body.groupname;
  let eventOrder = req.body.dateOrder;

  Event.find({
      email: req.user.email,
      groupname: sentGroupName
    }).sort({
      date: eventOrder
    })
    .then(events => {

      Group.find({
          email: req.user.email
        })
        .then(groups => {

          let groupResults = new Array();
          for (i = 0; i < groups.length; i++) {
            groupResults.push(groups[i].groupname);
          }

          let userGroups = new Array();
          let userSet = new Set(groups);
          for (i = 0; i < groupResults.length; i++) {

            let groupSetHas = userSet.has(groupResults[i]);
            if (groupSetHas === false) {
              userGroups.push(groupResults[i]);
              userSet.add(groupResults[i]);
            }
          }

          let searchGroups = new Array();

          for (i = 0; i < groupResults.length; i++) {
            searchGroups[i] = groups[i].groupname;
            console.log(searchGroups[i]);
          }

          res.render('viewevents', {
            user: req.user,
            events: events,
            groups: userGroups,
            searchGroups: searchGroups
          })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

router.get('/eventsview', ensureAuthenticated, (req, res) => {

  Event.find({
      email: req.user.email
    }).sort({
      date: 'asc'
    })
    .then(events => {
      Group.find({
          email: req.user.email
        })
        .then(groups => {

          let groupResults = new Array();
          for (i = 0; i < groups.length; i++) {
            groupResults.push(groups[i].groupname);
          }

          let userGroups = new Array();
          let userSet = new Set(groups);
          for (i = 0; i < groupResults.length; i++) {

            let groupSetHas = userSet.has(groupResults[i]);
            if (groupSetHas === false) {
              userGroups.push(groupResults[i]);
              userSet.add(groupResults[i]);
            }
          }

          let searchGroups = new Array();

          for (i = 0; i < groupResults.length; i++) {
            searchGroups[i] = groups[i].groupname;
            console.log(searchGroups[i]);
          }

          res.render('viewevents', {
            user: req.user,
            events: events,
            groups: userGroups,
            searchGroups: searchGroups
          })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

module.exports = router;