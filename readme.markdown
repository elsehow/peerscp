# peerscp

a dumb-simple peer-to-peer "scp" over webrtc

this still doesn't work with directories, nor does it support encryption. pull requests are super welcome!

# usage

`peerscp shared-key@my-signal-server.net`

Start a receiver on my-symmetric-key at the given signal server. Share the symmetric key with your friend. 

`peerscp *.gif shared-key@my-signal-server.net`

Send all files matching *.gif to whoever is listening at my-symmetric-key on the given signal server. This will only work if someone has run the receiver command elsewhere.

# install

With [npm](https://npmjs.org), do:

```
npm install -g peerscp
```

# license

MIT
