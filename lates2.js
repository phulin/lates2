Lates = new Meteor.Collection('lates');

months = [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ]
days = [ "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday" ];

if (Meteor.isServer) {
  Meteor.publish('lates', function() {
    // Publish the entire collection on the server
    return Lates.find();
  });
}

if (Meteor.isClient) {
  Meteor.startup(function() {
    Session.setDefault('current_day', new Date());
    Session.setDefault('lates_done_loading', false);
  });
  
  Meteor.subscribe('lates', function() {
    Session.set('lates_done_loading', true);
    Lates.find().forEach(function(late) {
      Session.set(late._id, true);
    });
  });

  function can_modify() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return current_day() > yesterday;
  }

  function current_day() {
    var cur = Session.get('current_day');
    return cur ? cur : new Date();
  }

  Template.late.can_modify = can_modify;
  Template.late_list.can_modify = can_modify;

  Template.late_list.loading = function() {
    return Session.get('lates_done_loading') ? false : true;
  };

  Template.late_list.has_lates = function() {
    return Lates.find({
      'date': current_day().toDateString(),
    }).count() > 0;
  };

  Template.late_list.todays_lates = function() {
    return Lates.find({
      'date': current_day().toDateString(),
    });
  };
  
  Template.late_list.today = function() {
    var cur = current_day();
    return days[cur.getDay()] + ', ' + months[cur.getMonth()] + ' ' + cur.getDate();
  };

  Template.late.rendered = function() {
    var item = $(this.find('.late-item'));
    var id = item.attr('id');
    if (!Session.get(id)) {
      item.hide();
      Meteor.defer(function() { item.slideDown(); });
      Session.set(id, true);
    }
  };

  Template.late_list.events = {
    'click #request-submit': function(e) {
      e.preventDefault();
      if ($('#name').val().length > 0) {
        Lates.insert({
          'name': $('#name').val(),
          'refrigerated': $('#refrigerated').prop('checked'),
          'veggie': $('#veggie').prop('checked'),
          'date': current_day().toDateString(),
        });
        $('#name').val("");
      }
    },

    'click .late-cancel': function(e) {
      e.preventDefault();
      var late_item = $(e.target).parents('.late-item');
      var id = late_item.attr('id');
      late_item.slideUp(400, function() {
        Lates.remove({
          '_id': id,
        });
      });
    },

    'click #prev': function(e) {
      e.preventDefault();
      var cur = current_day();
      cur.setDate(cur.getDate() - 1);
      Session.set('current_day', cur);
    },

    'click #next': function(e) {
      e.preventDefault();
      var cur = current_day();
      cur.setDate(cur.getDate() + 1);
      Session.set('current_day', cur);
    },

    'click #today': function(e) {
      e.preventDefault();
      Session.set('current_day', new Date());
    }
  };
}
