
/*
 * Download all smart contract information of Ethereum blocks
 *
 * !!! NOTE !!!
 * First, a synchronized Geth node must be running
 */
const Web3 = require('web3');
const fs = require('fs');
const mkdirp = require('mkdirp');
const net = require('net');
 
const filedir = "/home/user/ethereum/samples/";

const nodeIpc = "/home/user/.ethereum/geth.ipc";

var web3 = new Web3('/home/user/.ethereum/geth.ipc', net);
var checkedBlocks = 0;
var toCheck = 0;


/*
* Converts a given object to JSON representation for 
* better readability. 
*/
function repr( obj ) {
  return JSON.stringify(obj, null, 2);
}


function writeFile(filepath, filename, content) {
    mkdirp(filepath, function (err) {
        if (err) {
            console.error(err);    
            return;
        }
    
        fs.writeFile(filepath + filename, content, function(err) {
            if(err) {
                return console.log(err);
            }
        }); 
    });
}

function writeBytecodeFile(transaction) {
    if( transaction.input.length == 0 ) {
        return false;
    }
    var bytecode = transaction.input;
    if( transaction.input.substring(0,2) == "0x") {
        bytecode = transaction.input.substring(2, transaction.input.length);
    }
    writeFile(filedir + "bytecode/", transaction.hash + ".input", bytecode);
    return true;
}

function writeContractDescriptor(transaction) {
    writeFile(filedir + "descriptor/", transaction.hash + ".desc", repr(transaction));
}

/*
* Clean up and close connections
*/
function cleanup() { 
    //web3.currentProvider.connection.close(); 
    // a little bit hacky. However, 
    // the script does not terminate after it did 
    // its work. 
    process.exit(0);
}

/*
* Check if all blocks are checked and clean up
*/ 
function checkIfFinished() {
    if( checkedBlocks == toCheck ) {
        cleanup();
        console.log("DONE");
    }
}


/*
* Check the block for contract creation transactions 
* and write the bytecode and descriptor to file
*/
function analyzeBlock(blocknumber) {

    var blockCreationAddress = null;
  
    web3.eth.getBlock(blocknumber, true, function(error, block) {
    
        if(!error && block != null && block.transactions != null) {
            
            // search in all transactions of the block
            block.transactions.forEach( function(e) {
                
                if (e != null && (blockCreationAddress == "*" || blockCreationAddress == e.from || blockCreationAddress == e.to)) {
                
                    // create a file with the bytecode
                    // and a file with a description
                    console.log("[Block " + blocknumber + "] Contract found: " + e.hash);
                    if( writeBytecodeFile(e) ) {
                        writeContractDescriptor(e);
                    }
                }
            });
            
        } else if(error) {
            console.error(error);
        } else {
            console.error("[Block " + blocknumber + "] Either no block or no transactions are provided!");
        }
        
        console.log("[Block " + blocknumber + "] FINISHED.");
        checkedBlocks += 1;
        checkIfFinished();
    
    });
}


/*
* Downloads all transactions which created a contract in the blocks between 
* 'startBlockNumber' and 'endBlockNumber'. 
*
*/
function getContracts(startBlockNumber, endBlockNumber) {

  if (endBlockNumber == null) {
    endBlockNumber = eth.blockNumber;
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    startBlockNumber = endBlockNumber - 1000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  
  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    if (i % 100 == 0) {
      console.log("Searching block " + i);
    }
    
    analyzeBlock(i);
  }
}


//
// Script
//

if( process.argv.length < 4 ) {
    console.error("Use: npm start <startBlockNumber> <endBlockNumber>");
    cleanup();
    return;
}

start = process.argv[2]; 
end = process.argv[3];
if( isNaN(start) || isNaN(end) ) {
    console.error("Provided boundaries are no numbers!");
    cleanup();
    return;
}
if( start > end ) {
    console.error("Starting block must be smaller than ending block");
    cleanup();
    return;
}

toCheck = end - start + 1; 
console.log("Searching for contracts in blocks " + start + " to " + end);
getContracts(start, end);
