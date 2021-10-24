# RogueNet

A social space inspired by traditional character display roguelikes.

Made by slashie_

Uses JS for both the client and the server.

Based on JSRL boilerplate

## Server
Uses socket.io and express.

## Client
Uses unicodetiles.js, and socket.io

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Top needs
- Persistent players - Right now they are just held in memory. Need to decide what to use (mongodb? plain text files?), restore on startup and save on shutdown (need a proper shutdown procedure) or on a given frequency.
- Moving between levels, both using stairs and moving outside the map
