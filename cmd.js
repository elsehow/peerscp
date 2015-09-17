#!/usr/bin/env node

var Peer = require('simple-peer');
var exec = require('child_process').exec;
var fs   = require('fs');
var path = require('path');
var read = function (f) { return fs.createReadStream(f) }
var _    = require('lodash')

var through = require('through2')
var CombinedStream = require('combined-stream');

var signalhub  = 'http://indra.webfactional.com'
var socket     = require('socket.io-client')(signalhub)
var jsonClient = require('request-json').createClient(signalhub)

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    boolean: [ 'initiate' ],
    alias: {
        i: 'initiate',
        k: 'key',
        h: 'help'
    }
});
if (argv.help || argv._[0] === 'help') {
    return fs.createReadStream(path.join(__dirname, 'usage.txt'))
        .pipe(process.stdout)
    ;
}

var makePeer = function (isInitiator) {
  return new Peer({
      initiator: isInitiator,
      wrtc: require('wrtc'),
      trickle: false
  })
}

var handshake = function (reference, type) {
  return {
    type: type,
    reference: reference
  }
}

var shareSignal = function (signal, type) {
  var ref = JSON.stringify(signal)
  jsonClient.post('/', handshake(ref, type), function (_, _, _) { return })
  //console.log('shared', signal)
}

// if (!argv.key) {
//   console.log("You'll need a key. Run with --help for more information.")
//   process.exit(0)
// }

var offer_event = "pssh-offer"
var answer_event = "pssh-answer"
var files_to_send = argv._

if (argv.initiate) { 
  socket.on(answer_event, function (d) {
    socket.disconnect()
    //console.log('ok, we should be ready to connect now...', d)
    peer.signal(JSON.parse(d.reference))
    process.stdin.pipe(peer).pipe(process.stdout);
  })
  var peer = makePeer(true)
  peer.once('signal', function (s) {
    shareSignal(s, offer_event)
  })
  peer.on('connect', function () {
    var combinedStream = CombinedStream.create();
    files_to_send.forEach(function (file) {
      // NOW FOR EACH FILE
      // I ALSO WANT TO APPEND A STREAM OF LIKE,,,
      // THE FILENAME...?
      combinedStream.append(function(next) {
        next(fs.createReadStream(file))
      })
    })
    combinedStream.pipe(peer)
  })
}

if (!argv.initiate) {
  socket.on(offer_event, function (d) {
    socket.disconnect()
    var peer = makePeer(false)
    peer.signal(JSON.parse(d.reference))
    peer.once('signal', function (s) {
      shareSignal(s, answer_event)
    })
    var thru = through(function(buf, _, next) {
      this.push(JSON.parse(buf, 'base64'))
      next()
    })
    peer.on('connect', function () {
      // peer.pipe(thru).pipe(process.stdout)
      peer.pipe(process.stdout)
    })
    // peer.on('data', function (d) { console.log(d) // peer.pipe(process.stdout) })
  })
}