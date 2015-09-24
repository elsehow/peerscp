var _      = require('lodash')
var urlify = function (str) {
  if (!_.startsWith(str, 'http://'))
    return 'http://'+str
  return str
}


var setup = function (process) {
  var argv  = require('minimist')(process.argv.slice(2))
  var files = _.initial(argv._)
  var route = _.last(argv._).split('@')
  var key   = route[0]
  var host  = urlify(route[1])
  return {files: files, key: key, host: host}
}

//module.exports = setup
setup(process)
