Lates = new Meteor.Collection('lates');

months = [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ]
days = [ "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday" ];
      
if (Meteor.isServer) {
      Meteor.publish('lates', function () {
            // Publish the entire collection on the server
            return Lates.find();
      });
}

if (Meteor.isClient) {
    Session.setDefault('lates-loading', true);
    
    Meteor.subscribe('lates', function () {
          Session.set('lates-loading', false);
    });

  Template.late_list.loading = function() {
    return Session.get('lates-loading');
  };

  Template.late_list.has_lates = function() {
        return Lates.find().count() > 0;
  };

  Template.late_list.todays_lates = function() {
    return Lates.find({
      'date': new Date().toDateString(),
    });
  };
  
  Template.late_list.today = function() {
    var now = new Date();
    return days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
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
          'date': new Date().toDateString(),
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
    }
  };
}
