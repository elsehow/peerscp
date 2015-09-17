#!/usr/bin/env node

var Peer = require('simple-peer');
var fs   = require('fs');
var path = require('path');
var through = require('through2')
var CombinedStream = require('combined-stream2');
var signalhub  = 'http://indra.webfactional.com'
var socket     = require('socket.io-client')(signalhub)
var jsonClient = require('request-json').createClient(signalhub)
var minimist = require('minimist');
// returns a read stream from file
var p = function (f) { return path.join(__dirname, f) }
var read = function (f) {return fs.createReadStream(p(f))}
var write = function (f) {return fs.createWriteStream(p(f))}
// posts object d to signalhub as json, return snothing
var post = function (d) {jsonClient.post('/', d, function(_, _, _){ return })}
var empty = function (x) { return x.length==0 }

// TODO arguments
// files (which are passed to the cli with no flag) get saved in argv._
var argv = minimist(process.argv.slice(2), {
    alias: { h: 'help', }
});

// TODO
// if user did something wrong, 
// let them know
// console.log(empty(argv._))
// if (argv.help 
//     || argv._[0] === 'help'
//     || (argv.i && empty(argv._))
//     || (!argv.i && !empty(argv._))) {
//   read('usage.txt').pipe(process.stdout);
// }

// make a simple-peer peer
var makePeer = function (isInitiator) {
  return new Peer({
      initiator: isInitiator,
      wrtc: require('wrtc'),  // for node only, no wrtc thing in browser
      trickle: false,  // no idea what trickle means
  })
}

// signal to a peer p some introduction signal s
var signal = function (p, s) {
  p.signal(JSON.stringify(s))
}

var handshake = function (signal, type) {
  return {
    signal: signal,
    type: type,
  }
}

var receiver = function (connectCb) {
  socket.on(offer_event, function (offer) {
    socket.disconnect()
    var peer = makePeer(false)
    signal(peer, offer.signal)
    peer.once('signal', function (answer) {
      post(handshake(answer, answer_event))
    })
    peer.on('connect', function () {
      connectCb(peer)
    })
  })
}

var sender = function (connectCb) {
  // setup a listener for receiver's answer event
  socket.on(answer_event, function (answer) {
    // on peer's answer, we mirror their signal back to connect
    signal(peer, answer.signal)
    socket.disconnect()
  })
  // initiate an offer introduction to receiver
  var peer = makePeer(true)
  peer.once('signal', function (offer) {
    post(handshake(offer, offer_event))
  })
  // on connect
  peer.on('connect', function () {
    connectCb(peer)
  })
}

var receiverRoutine = function (peer) {
  var filenames = through(function (buf, _, next) {
    try {
      var f = JSON.parse(buf).file
      console.log('receiving', f)
      this.pipe(write('TEST-'+f))
      next()
    } catch (_) {
      this.push(buf)
      next()
    }
  })
  peer.pipe(filenames)
}

var senderRoutine = function (peer) {
  // stream files
  var combinedStream = CombinedStream.create();
  // files (which are passed to the cli with no flag) are in argv._
  argv._.forEach(function (file) {
    combinedStream.append(function(next) {
      next('{"file":"' + file + '"}')
    })
    combinedStream.append(function(next) {
      next(read(file))
    })
  })
  combinedStream.pipe(peer)
}

var offer_event = "pssh-offer"
var answer_event = "pssh-answer"

if (!empty(argv._)) { 
  console.log('sending ', argv._, ', initiating connection to peer...')
  sender(senderRoutine)
}

// TODO: should be using base64?
if (empty(argv._)) {
  receiver(receiverRoutine)
}
