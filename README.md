# ethereum-bytecode-downloader
Web3-based Smart Contract downloader

The downloader downloads all smart contracts found in the blocks from `startBlock` to `endBlock`. 
Running the downloader requires a running Geth-Node that has synchronized the requested blocks. 
The downloader connects to the node via IPC. You have to define the correct IPC in the file `index.js`. 
Downloaded contracts are written to the directory defined in `index.js`. 

# Installation
To run and install dependencies Node.js and NPM is required. 
Install dependencies: 

`npm install`

# Usage
`npm start {startBlock} {endBlock}`
