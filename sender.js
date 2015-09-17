#!/usr/bin/env node

var Peer = require('simple-peer')
var fs   = require('fs')
var argv = process.argv.slice(2)
var read = function (f) { return fs.createReadStream(f) }

var peer = new Peer({
  initiator: true, 
  wrtc: require('wrtc'),
  trickle: false,
})

console.log(argv)

peer.once('signal', function (signal) {
  // var ref = Buffer(JSON.stringify(signal)).toString('base64');
  console.log(signal)
})

// send the files we're interested in 
peer.send(argv) // send files to the peer
// when we get receipt from receiver
// peer.on('data', function (_) {
  // stream each file
argv.forEach(function (file) {
  console.log('sending', file)
  read(file).pipe(peer)
})
// }