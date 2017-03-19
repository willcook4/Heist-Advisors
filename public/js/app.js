var HeistApp = HeistApp || {};

HeistApp.API_URL = '/api';

HeistApp.setRequestHeader = function(jqXHR) {
  var token = window.localStorage.getItem('token');
  if(token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
};

HeistApp.getTemplate = function(template, data) {
  $.get('/templates/' + template + '.html')
    .done(function(templateHtml) {
      var html = _.template(templateHtml)(data);
      HeistApp.$main.html(html);
      // Load the Javascript for that page
      if(template === 'home' || template === 'game'){
        $.getScript( '/js/' + template + '.js', function() {
          // console.log('got the ' + template + ' script');
        });
      }
    });
};

HeistApp.getGame = function() {
  event.preventDefault();
  HeistApp.getTemplate('game');
};

HeistApp.getHome = function() {
  event.preventDefault();
  HeistApp.getTemplate('home');
};

HeistApp.handleForm = function() {
  event.preventDefault();

  $(this).find('button').prop('disabled', true);

  var data = $(this).serialize();
  window.localStorage.setItem('currentUserEmail', $(this)[0][0].value);
  var method = $(this).attr('method');
  var url = HeistApp.API_URL + $(this).attr('action');

  return $.ajax({
    async: true,
    url: url,
    method: method,
    data: data,
    beforeSend: HeistApp.setRequestHeader
  })
  .done(function(data) {
    if(!!data.token) {
      window.localStorage.setItem('token', data.token);
    }
    HeistApp.getGame();
    HeistApp.updateUI();
  })
  .fail(HeistApp.handleFormErrors);
};

HeistApp.handleFormErrors = function(jqXHR) {
  console.log(jqXHR);
  var $form = $('form');
  for(var field in jqXHR.responseJSON.errors) {
    $form.find('input[name=' + field + ']').parent().find('small').removeClass('show-for-sr');
  }
  $form.find('button').removeAttr('disabled');
};

HeistApp.loadPage = function() {
  event.preventDefault();
  var templateName = $(this).data('template');
  HeistApp.getTemplate(templateName);
};

HeistApp.logout = function() {
  event.preventDefault();
  window.localStorage.clear();
  HeistApp.updateUI();
};

HeistApp.updateUI = function() {
  var loggedIn = !!window.localStorage.getItem('token');
  window.localStorage.getItem('currentUserEmail');
  if(loggedIn) {
    $('.user-email').html(window.localStorage.getItem('currentUserEmail'));
    $('.logged-in').removeClass('hidden');
    $('.logged-out').addClass('hidden');
    HeistApp.getTemplate('game');
  } else {
    $('.user-email').html('');
    $('.logged-in').addClass('hidden');
    $('.logged-out').removeClass('hidden');
    HeistApp.getTemplate('home');
  }
};

HeistApp.initEventHandlers = function() {
  this.$main = $('main');
  this.$main.on('submit', 'form', this.handleForm);
  $('.navbar a').not('.logout').on('click', this.loadPage);
  $('.navbar a.logout').on('click', this.logout);
  this.$main.on('focus', 'form input', function() {
    $(this).parent().find('small').addClass('show-for-sr');
  });
};

HeistApp.init = function() {
  this.initEventHandlers();
  this.updateUI();
}.bind(HeistApp);

$(HeistApp.init);




