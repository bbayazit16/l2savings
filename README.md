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

The formula for Optimism Transaction fee is (Gas Price _Gas) + (L1 Gas Used_ L1 Fee Scalar \* L1 Gas Price).
Optimistic Etherscan doesn't provide the transaction fee in their API, let alone the L1 Fee Scalar, L1 Gas Price and L1 Gas used. Due to this reason the L1 gas price and overhead is extracted from eth_getTransactionReceipt calls to an Optimism RPC.

For more info, see [the FAQ](https://l2savings.org/faq)

### Arbitrum

[Arbitrum](https://arbitrum.io/) is not EVM equivalent, but EVM compatible. Due to it's design, the Arbitrum Virtual Machine (AVM) requires [a different approach to gas](https://developer.offchainlabs.com/docs/arbgas). Each unit is called an "arbgas".

> ArbGas is a measure of how long it takes for a validator to emulate execution of an AVM computation. This is scaled so that 100 million ArbGas is approximately equal to 1 second of CPU time on the Offchain Labs developer laptops in early 2020.

This principle makes it easy to calculate the total L2 transaction fee spent, (l2 gas \* l2 gas price), however makes it hard to estimate how much the transaction would cost if it was sent on Ethereum Mainnet. An Ether transfer typically costs around 420,000 gas, compared to Ethereum's 21,000 gas. Note that because L2 gas prices are low, it is cheaper to transfer Ether with 420,000 gas than 21,000 gas. In this case, gas is not a valid metric to compare transaction costs.

- For transactions with known signatures, use the hardcoded gas amount:
- 21,000 gas for ETH transfers,
- 50,000 gas for ERC20 swaps and approvals,
- 105,000 gas for swaps,
- 150,000 gas for multicall as it can be used for anything
- 200,000 gas for add/remove liquidity
- 100,000 gas for deposits/withdraw (to any protocol)
- 200,000 gas for purchase
- 150,000 gas for stake

For other signatures, use the following formula:
arbgas <= 450,000                21,000
450,000 < arbgas <= 750,000      50,000 + arbgas / 100
else                             (arbgas / 8) + 21_000;

## ZkSync

[ZkSync](https://zksync.io/) is a [ZK (Zero Knowledge) Rollup](https://docs.ethhub.io/ethereum-roadmap/layer-2-scaling/zk-rollups/) which is an L2 much cheaper than Optimistic Rollups.

> Two rollups walk into a bar. The barman asks: "Can I see your ids?". ZK Rollup says: "I can prove to you I'm over 18, but I won't show you my id". Optimistic Rollup says: "If nobody can prove I'm underage in 7 days that means I'm over 18" [Source](https://twitter.com/l2beatcom/status/1448556881686024192)

 However ZkSync is not EVM equivalent, making it harder to predict equivalent L1 gas cost of operations. ZkSync has "types" of transactions, which are ChangePubKey, Transfer, Swap, Withdraw, ForcedExit, MintNFT and WithdrawNFT. The L2 <--> L1 gas is estimate is thus done by using the average costs for each operation on Ethereum L1. Which means Ether transfers are considered as 21000 gas, token transfers 65000, swaps 160000 and NFT Mints 150000. ZkSync also allows users to pay with different tokens, such as stablecoins, which requires the conversion of fees paid into ether with the price rate during the time of transaction. For a diagram of how the calculation process goes, see [this diagram.](https://github.com/bbayazit16/L2Savings/blob/master/src/Savings/ZkSync.ts#L20).

## Installing Dependencies

_Make sure you are on the root directory and have yarn installed._

```sh
yarn install
```

## Starting Development Server

_Make sure you are on the root directory and have yarn installed._

```sh
yarn dev
```

## Building From Source

_Make sure you are on the root directory and have yarn installed._

```sh
yarn build
```

## Serving App From Build

_Make sure you are on the root directory._

Install serve if you haven't already:

```sh
yarn global add serve
```

Then run:

```sh
serve -s build
```

## License

[AGPL-3.0-only](LICENSE)

## Made Possible Thanks To

- @download/blockies for blockies identicons
- Ethers, Etherscan, Optimistic Etherscan, Arbiscan, ZkSync API's
- David Mihal's Ethereum Average Fees Subgraph
