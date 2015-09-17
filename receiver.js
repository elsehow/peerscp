#!/usr/bin/env node
var init_offer = { type: 'offer', sdp: 'v=0\r\no=- 4282037999128485544 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=msid-semantic: WMS\r\nm=application 37953 DTLS/SCTP 5000\r\nc=IN IP4 136.152.142.136\r\na=candidate:2218435994 1 udp 2122063615 192.168.99.1 54212 typ host generation 0\r\na=candidate:4057402361 1 udp 2121998079 10.142.136.148 54791 typ host generation 0\r\na=candidate:1029321834 1 udp 1685790463 136.152.142.136 37953 typ srflx raddr 10.142.136.148 rport 54791 generation 0\r\na=candidate:3401144682 1 tcp 1518083839 192.168.99.1 62555 typ host tcptype passive generation 0\r\na=candidate:3210016521 1 tcp 1518018303 10.142.136.148 62556 typ host tcptype passive generation 0\r\na=ice-ufrag:djGjm89cEjR7dqlR\r\na=ice-pwd:TfLnc9zzytmEMPuU2AnHM4Bc\r\na=ice-options:google-ice\r\na=fingerprint:sha-1 9E:7D:77:88:01:B3:E1:5D:5E:4D:2D:AB:9D:0D:95:D4:3C:7A:98:73\r\na=setup:actpass\r\na=mid:data\r\na=sctpmap:5000 webrtc-datachannel 1024\r\n' }

var fs = require('fs')
var argv = (process.argv.slice(2))
var read = function (f) { return fs.createReadStream(f) }
var wrtc = require('wrtc')
var Peer = require('simple-peer')

var peer = new Peer({
  initiator:false, 
  wrtc: wrtc,
  trickle: false,
})

peer.signal(init_offer)

peer.on('signal', function (s) {
  console.log(s)
})

// // when we get receipt from receiver
// peer.on('data', function (files) {
//   peer.send(200)
//   // TODO - each file ==> write a file in `files`
//   peer.pipe(process.stdout)
// })