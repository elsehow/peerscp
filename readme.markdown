# peerssh

a dumb-simple peer-to-peer "ssh" over webrtc

# usage

  peerssh -k my-key

Listen for a connection over my-key. Share this key with your friend.
 
  peerssh -i -k my-key
 
Initiate a connection over my-key. This will only work if some other machine has run peerssh -k my-key already.

After the introductions, stdin is forwarded to the remote connection and data from the remote connection goes to stdout.

For example:
  
  peerssh -k my-key > cool-file.mp3
  
And on the other end:

  peerssh -i -k my-key < file-to-share.mp3

# install

With [npm](https://npmjs.org), to get the `peerssh` command do:

```
npm install -g peerssh
```

# license

MIT
