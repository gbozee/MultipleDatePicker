module.exports = function(source) {
  var html = "'" + source.replace(/"/g, '\\\"').replace(/\n/g, '\\') + "'";
  return "module.exports = \"" + html + "\"";
  // return "module.exports = \"" + html + "\"";
};