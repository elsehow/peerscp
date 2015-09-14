# peerscp

a dumb-simple peer-to-peer "ssh" over webrtc

# usage

`peerscp -k my-key`

Listen for a connection over my-key. Share this key with your friend.
 
  `peerscp -i -k my-key`
 
Initiate a connection over my-key. This will only work if some other machine has run `peerscp -k my-key` already.

After the introductions, stdin is forwarded to the remote connection and data from the remote connection goes to stdout.

For example:
  
  `peerscp -k my-key > cool-file.mp3`
  
And on the other end:

  `peerscp -i -k my-key < file-to-share.mp3`

# install

With [npm](https://npmjs.org), to get the `peerscp` command do:

```
npm install -g peerscp
```

# license

MIT
