# SushiBlox-Website

Website for sushiblox I guess.

~~Private for now might open source.~~

The setup is ~~easy install required node modules and setup a nginx reverse proxy on port 9000.~~

Uses MongoDB for datastorage. Redis for special things

# Advice

~~This uses hardcoded domain names in the code~~ and relies on cloudflare headers for IP configs. so yeahhhhhhhhhhhhhhhhhhhhhhhhhh

# Redis

idk set it up nerd

# setup

easy enough

# Example

```
PROTOCOL_HEADER=x-forwarded-proto HOST_HEADER=x-forwarded-host pm2 start server.mjs
```

# Setting up Access keys

Open regedit go to Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node

Make a key called ROBLOX Corporation if it doesn't exist

Inside of that key make another key called Roblox if it doesn't exist

Finally inside that key made a string value called AccessKey for the value put the same value as the one from the env file thank you.

# Contribution

Anyone is welcome to contribute.
