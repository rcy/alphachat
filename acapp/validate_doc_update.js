function(newDoc, oldDoc, userCtx) {
  function require(field, message) {
    message = message || "Document must have a " + field;
    if (!newDoc[field]) throw({forbidden : message});
  };

  require('type');

  if (newDoc.type == 'message') {
    require('cmd');
    require('sender');
    require('target');
  } else if (newDoc.type == 'control') {
    require('cmd');
    require('target');
  }
}
