'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/NLPcontroller');

  // todoList Routes
  app.route('/train')
    .get(todoList.train)


  app.route('/response')
    .post(todoList.response)
    


  
};
