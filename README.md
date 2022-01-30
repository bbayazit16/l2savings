# L2Savings

_How much fees have you saved by using Ethereum L2's?_

See how much fees Ξ$ you saved on [l2savings.org](https://www.l2savings.org)!

## Motivation

Ethereum Layer 2 solutions offer near-instant confirmations, Ethereum-level security and decentralization, and near-infinite scalability. They are one of the most convenient ways of solving the [blockchain trilemma](https://vitalik.ca/general/2021/04/07/sharding.html), along with [sharding](https://ethereum.org/en/upgrades/shard-chains/). However Ethereum Layer 2's often lack marketing and incentives to push developers to deploy their applications on them. L2Savings aims to show how much anyone has saved by using Ethereum L2's compared to if their transactions were sent on Ethereum Mainnet.

## Data Provided

Following data is provided for every supported chain:

- Transaction Count On L2
- Gas Spent on L2 (Converted To Mainnet Gas If Applicable)
- Chain-Native Gas Spent (eg. arbgas)
- L2 Fees Paid in Ether
- L2 Fees Paid in USD (according to Ether's current value)
- L1 Fees Paid in Ether (If L2 transactions were sent on L1)
- L1 Fees Paid in USD
- Fees Saved in Ether and USD
- Times cheaper (How many times is L2 cheaper than L1)

## How Savings Are Calculated

Simply put,

Fees if the transaction was sent on L1 at the same day with exactly the same gas - Actual fees paid for transaction on L2

### Optimism

For EVM equivalent L2's such as [Optimism](https://optimism.io/), it is easy to calculate the equivalent L1 cost, because the concept of gas is same on the L2. (L2 Gas \* Mainnet gas price at the time of transaction).

The formula for Optimism Transaction fee is (Gas Price _ Gas) + (L1 Gas Used _ L1 Fee Scalar \* L1 Gas Price).
Optimistic Etherscan doesn't provide the transaction fee in their API, let alone the L1 Fee Scalar, L1 Gas Price and L1 Gas used. They also can not be found through JSON RPC API eth_getTransactionReceipt. So how do we calculate the transaction fee?

#### The OVM Gas Price Oracle

It is possible to calculate the L1 gas consumed (calldata cost) in an Optimism transaction. Each non-zero byte of the RLP encoded transaction costs 16 units of gas and each zero byte of RLP encoded transaction costs 4 gas. The Gas Price Oracle provides the function getL1GasUsed() to calculate the amount of L1 gas consumed given an RLP encoded transaction. Gas Price Oracle contract is deployed on [0x420000000000000000000000000000000000000F](https://optimistic.etherscan.io/address/0x420000000000000000000000000000000000000F) on Optimism.

```solidity
function getL1GasUsed(bytes memory _data) public view returns (uint256) {
    uint256 total = 0;
    for (uint256 i = 0; i < _data.length; i++) {
        if (_data[i] == 0) {
            total += 4;
        } else {
            total += 16;
        }
    }
    uint256 unsigned = total + overhead;
    return unsigned + (68 * 16);
}
```

From the Natspec comment on the contract:

> The overhead represents the per batch gas overhead of
> posting both transaction and state roots to L1 given larger
> batch sizes.

Overhead on Optimism is currently 2100 gas, dropped from 2750 gas on transaction index [2071714](https://optimistic.etherscan.io/tx/2071714).

Similarly, L1 fee scalar was dropped from 1.5 to 1.24 on index [2071713](https://optimistic.etherscan.io/tx/2071713).

Now that overhead and L1 gas scalar is known, the function can be implemented on Javascript to avoid sending requests to the contract for each transaction and to calculate the L1 gas used with a specific amount of overhead (2750 gas before index 2071714, 2100 after).

```js
const ovmL1GasUsed = (bytes, index) => {
  // cut 0x from string
  if (bytes.substring(0, 2) === "0x") {
    bytes = bytes.substring(2);
  }

  let total = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    if (parseInt(bytes[i] + bytes[i + 1], 16) === 0) {
      total += 4;
    } else {
      total += 16;
    }
  }
  return total + getOVMOverhead(index) + 1088;
};
```

This leaves us with only one unknown variable, L1 gas price during the time of transaction. L1 gas price can't be exactly found out, because there is no API that provides detailed L1 gas price history. However daily average gas can be used, thanks to [Etherscan Data](https://etherscan.io/chart/gasprice). Using the average gas price of each day, the equivalent transaction cost if the transaction was sent on L1 can be esimated with (L1 gas price \* L2 gas). This approach requires the average gas prices to be retrieved every day, and the script to do so can be found [here](src/get_historical_gas.py).

### Arbitrum

[Arbitrum](https://arbitrum.io/) is not EVM equivalent, but EVM compatible. Due to it's design, the Arbitrum Virtual Machine (AVM) requires [a different approach to gas](https://developer.offchainlabs.com/docs/arbgas). Each unit is called an "arbgas".

> ArbGas is a measure of how long it takes for a validator to emulate execution of an AVM computation. This is scaled so that 100 million ArbGas is approximately equal to 1 second of CPU time on the Offchain Labs developer laptops in early 2020.

This principle makes it easy to calculate the total L2 transaction fee spent, (l2 gas \* l2 gas price), however makes it hard to estimate how much the transaction would cost if it was sent on Ethereum Mainnet. An Ether transfer typically costs around 420,000 gas, compared to Ethereum's 21,000 gas. Note that because L2 gas prices are low, it is cheaper to transfer Ether with 420,000 gas than 21,000 gas. In this case, gas is not a valid metric to compare transaction costs. Arbgas, compared to Ethereum L1 gas for common contract calls such as approve, transfer, and swap, approximately gives the following esimated formula:

```js
if (L2Gas >= 410_000 && L2Gas <= 430_000) {
  // ETH Transfer
  gasIfOnMainnet = 21_000;
} else if (L2Gas >= 600_000 && L2Gas <= 800_000) {
  gasIfOnMainnet = 160_000 + L2Gas / 100;
} else if (L2Gas >= 500_000 && L2Gas <= 600_000) {
  gasIfOnMainnet = 50_000 + L2Gas / 100;
} else if (L2Gas >= 430_000 && L2Gas <= 5000) {
  gasIfOnMainnet = 30_000 + L2Gas / 100;
} else {
  gasIfOnMainnet = L2Gas / 8 + 25_000;
}
```

Similar to Optimism, each non-zero byte of the RLP encoded transaction costs 16 units of gas and each zero byte of RLP encoded transaction costs 4 gas. However my efforts to formulate an equation with this approach was ill-fated. If you have a better formula, please open an issue. I'd appreciate some help 🙂.

## ZkSync

[ZkSync](https://zksync.io/) is a [ZK (Zero Knowledge) Rollup](https://docs.ethhub.io/ethereum-roadmap/layer-2-scaling/zk-rollups/) which is an L2 much cheaper than Optimistic Rollups.

> Two rollups walk into a bar. The barman asks: "Can I see your ids?". ZK Rollup says: "I can prove to you I'm over 18, but I won't show you my id". Optimistic Rollup says: "If nobody can prove I'm underage in 7 days that means I'm over 18" [Source](https://twitter.com/l2beatcom/status/1448556881686024192)

 However ZkSync is not EVM equivalent, making it harder to predict equivalent L1 gas cost of operations. ZkSync has "types" of transactions, which are ChangePubKey, Transfer, Swap, Withdraw, ForcedExit, MintNFT and WithdrawNFT. The L2 <--> L1 gas is estimate is thus done by using the average costs for each operation on Ethereum L1. Which means Ether transfers are considered as 21000 gas, token transfers 65000, swaps 160000 and NFT Mints 150000. ZkSync also allows users to pay with different tokens, such as stablecoins, which requires the conversion of fees paid into ether with the price rate during the time of transaction. For a diagram of how the calculation process goes, see line [580](https://github.com/bbayazit16/L2Savings/blob/993c2086c10c741a123270c915c3202bef3aad57/src/App/App.js#L580).

## Installing Dependencies

_Make sure you are on the root directory and have Python 3 and NPM installed._

```sh
pip3 install -r requirements.txt && python3 ./src/get_historical_gas.py && npm ci
```

## Starting Development Server

_Make sure you are on the root directory._

```sh
npm run start
```

## Building From Source

_Make sure you are on the root directory and have Python 3 and NPM installed._

```sh
python3 ./src/get_historical_gas.py && npm run build
```

## Serving App From Build

_Make sure you are on the root directory._

Install serve if you haven't already:

```sh
npm i -g serve
```

Then run:

```sh
serve -s build
```

## License

[MIT](LICENSE)

## Made Possible Thanks To

- @download/blockies for blockies identicons
- Chainlink Oracles
- Metamask
- WalletConnect
- Ethers
- React
- ENS for names and profile photos
- Etherscan, Optimistic Etherscan, Arbiscan API's
- Pandas and Requests for average gas price data script
- Optimism, Arbitrum, ZkSync and all other teams working on scaling
- Ethereum
