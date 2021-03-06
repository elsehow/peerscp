#!/usr/bin/env node

var Peer      = require('simple-peer');
var fs        = require('fs');
var through   = require('through2')
// return read/write streams given a filename
var read      = function (f) {return fs.createReadStream(f)}
var write     = function (f) {return fs.createWriteStream(f)}
// returns true if x is empty
var empty     = function (x) { return x.length==0 }
// parse peerscp syntax
var syntax    = require('./syntax.js')
// get arguments passed over CLI 
// (quits informatively if arguments are bad)
var argv      = syntax(process)
// signal hub stuff
// setup from command line arguments
var socket    = require('socket.io-client')(argv.host)
var poster    = require('request-json').createClient(argv.host)
var post      = function (d) {poster.post('/', d, function(_, _, _){ return })}
var offer_ev  = "peerscp-offer-"+argv.key
var answer_ev = "peerscp-answer-"+argv.key

// make a simple-peer 
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

var sender = function (connectCb) {
  // setup a listener for receiver's answer event
  socket.on(answer_ev, function (answer) {
    // on peer's answer, we mirror their signal back to connect
    signal(peer, answer.signal)
    socket.disconnect()
  })
  // initiate an offer introduction to receiver
  var peer = makePeer(true)
  peer.once('signal', function (offer) {
    post(handshake(offer, offer_ev))
  })
  // on connect to peer
  peer.on('connect', function () {
    connectCb(peer)
  })
}

var receiver = function (connectCb) {
  socket.on(offer_ev, function (offer) {
    socket.disconnect()
    var peer = makePeer(false)
    signal(peer, offer.signal)
    peer.once('signal', function (answer) {
      post(handshake(answer, answer_ev))
    })
    peer.on('connect', function () {
      connectCb(peer)
    })
  })
}

// TODO -r for recursive in directories
// TODO note about omitting dirs without -r
var senderRoutine = function (peer) {
  var binary_enc = through(function (buf, _, next) {
    this.push(new Buffer(buf).toString('binary'))
    next()
  })
  var combinedStream = require('combined-stream2').create();
  // stream each file passed over argv
  argv.files.forEach(function (file) {
    // send descriptive json before each file stream
    combinedStream.append(function(next) {
      console.log('sending', file)
      next('{"file":"' + file + '"}')
    })
    // stream the file
    combinedStream.append(function(next) {
      next(read(file).pipe(binary_enc))
    })
  })
  combinedStream.pipe(peer)
}

// TODO destroy existing files with the same name?
// test between two machines + with ben???
var receiverRoutine = function (peer) {
  // var gunzip    = zlib.createGunzip();
  var saveFiles = through(function (buf, _, next) {
    // if this is a json buffer, parse it, read the filename,
    // and pipe future data to an appropriate write stream
    try {
      var f = JSON.parse(buf).file
      console.log('receiving', f)
      this.pipe(write(f))
      next()
    // if this isnt a json buffer, keep pushing to write stream
    } catch (_) {
      this.push(new Buffer(buf, 'binary'))
      next()
    }
  })
  peer.pipe(saveFiles)
}

// run receiver routine if there aren't
var there_are_files =  empty(argv.files)
if (there_are_files) { sender(senderRoutine) }
if (!there_are_files) { receiver(receiverRoutine) }
