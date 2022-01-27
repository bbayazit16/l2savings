import "./App.css";
import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { createIcon } from "@download/blockies";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import historicalGasPrices from "../historicalGasPrices.json";
// Component Imports
import Buttonish from "../Components/Buttonish/Buttonish";
import Dropper from "../Components/Dropper/Dropper";
import InfoText from "../Components/InfoText/InfoText";
// Asset Imports
import optimism from "../Assets/optimism.svg";
import arbitrum from "../Assets/arbitrum.svg";
import l2savings from "../Assets/l2savingslogo.png";
import l2sgradient from "../Assets/l2sgradient.png";
import twitterlogo from "../Assets/twitterlogo.svg";
import metamasklogo from "../Assets/metamasklogo.svg";
import walletconnectlogo from "../Assets/walletconnectlogo.svg";
import githublogo from "../Assets/githublogo.png";
import zksync from "../Assets/zksync.svg";
//

const App = () => {
  const [connectWalletClicked, setConnectWalletClicked] = useState(false);
  const [randomTweet, setRandomTweet] = useState("");

  // Chains
  const [showAllChains, setShowAllChains] = useState(true);
  const [showOptimism, setShowOptimism] = useState(false);
  const [showArbitrum, setShowArbitrum] = useState(false);
  const [showZkSync, setShowZkSync] = useState(false);

  const walletContainerRef = useRef();

  const emptyInfo = () => {
    return {
      general: {
        L1FastGasPrice: "...",
        txCount: "...",
        gasSpent: "...",
        nativeGasSpent: "...",
        L2feesEther: "...",
        L2feesUSD: "...",
        L1feesEther: "...",
        L1feesUSD: "...",
        feesSavedEther: "...",
        feesSavedUSD: "...",
        timesCheaper: "...",
        etherPrice: "...",
        time: "...",
      },
      optimism: {
        txCount: "...",
        gasSpent: "...",
        nativeGasSpent: "...", // equal to L1 gas
        L1feesEther: "...",
        L1feesUSD: "...",
        L2feesEther: "...",
        L2feesUSD: "...",
        feesSavedEther: "...",
        feesSavedUSD: "...",
        timesCheaper: "...",
      },
      arbitrum: {
        txCount: "...",
        gasSpent: "...",
        nativeGasSpent: "...", // arbgas
        L1feesEther: "...",
        L1feesUSD: "...",
        L2feesEther: "...",
        L2feesUSD: "...",
        feesSavedEther: "...",
        feesSavedUSD: "...",
        timesCheaper: "...",
      },
      zksync: {
        txCount: "...",
        gasSpent: "...",
        nativeGasSpent: "...",
        L1feesEther: "...",
        L1feesUSD: "...",
        L2feesEther: "...",
        L2feesUSD: "...",
        feesSavedEther: "...",
        feesSavedUSD: "...",
        timesCheaper: "...",
      },
    };
  };

  // Provider to lookup ENS
  const [account, setAccount] = useState({
    address: null,
    ENS: null,
    displayAddress: null,
    profilePhoto: null,
  });

  const [info, setInfo] = useState(emptyInfo());

  // 0xAAAA...bbbb
  const shorten = addr => {
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
  };

  // 1000 -> 1,000 or 1.000 (depending on the browser settings)
  const localize = anyNum => {
    return anyNum.toLocaleString();
  };

  const serialLocalization = obj => {
    for (let key in obj) {
      for (let innerKey in obj[key]) {
        obj[key][innerKey] = localize(obj[key][innerKey]);
      }
    }
  };

  const unclick = () => {
    setShowAllChains(false);
    setShowOptimism(false);
    setShowArbitrum(false);
    setShowZkSync(false);
  };

  const toEther = num => {
    return parseFloat(ethers.utils.formatEther(num.toString()));
  };

  const toGwei = num => {
    return Math.round(parseFloat(ethers.utils.formatUnits(num, "gwei")));
  };

  // Chainlink Oracle Abi
  const oracleAbi = () => {
    // prettier-ignore
    return [{constant:true,inputs:[],name:"latestAnswer",outputs:[{name:"",type:"int256",},],
    payable:false,stateMutability:"view",type:"function"}];
  };

  // Grammar mistakes? Open an issue please. Thanks!
  const generateTweet = () => {
    if (info.general.L2feesEther === "0") {
      return encodeURIComponent(
        "I have never used an L2. However, if you have, go to l2savings.org to check how much fees you have saved! @L2savings"
      );
    }
    const mode = parseInt(Math.random() * 8);
    let tweet;
    switch (mode) {
      case 0:
        tweet = `I've spent Ξ${info.general.L2feesEther} fees on Ethereum L2's. If I had sent my transactions on L1, it would have cost Ξ${info.general.L1feesEther}.`;
        break;
      case 1:
        tweet = `I have saved Ξ${info.general.feesSavedEther} worth $${info.general.feesSavedUSD} by using Ethereum L2's.`;
        break;
      case 2:
        tweet = `L2's are magic. If I used Ethereum Mainnet instead of sending my transactions on L2's, I'd have paid Ξ${info.general.feesSavedEther} extra fees.`;
        break;
      case 3:
        tweet = `I love L2's. I saved $${info.general.L1feesUSD} thanks to them!`;
        break;
      case 4:
        tweet = `L2's make Ethereum usable again. I've saved $${info.general.L1feesUSD} by using L2's, while having instant confirmations and Ethereum Mainnet's security and decentralization.`;
        break;
      case 5:
        tweet = `My Ethereum L2 transactions have been ${info.general.timesCheaper}x cheaper so far compared to Ethereum Mainnet. I've saved $${info.general.feesSavedUSD}.`;
        break;
      case 6:
        if (parseInt(info.optimism.txCount) !== 0) {
          tweet = `By using Ethereum L2 Optimism, I have saved Ξ${info.optimism.feesSavedEther} worth $${info.optimism.feesSavedUSD} and had my transactions instantly confirmed.`;
        } else {
          tweet = `By using Ethereum L2 Arbitrum, I have saved Ξ${info.arbitrum.feesSavedEther} worth $${info.arbitrum.feesSavedUSD} and had my transactions instantly confirmed.`;
        }
        break;
      case 7:
        if (parseInt(info.arbitrum.txCount) !== 0) {
          tweet = `By using Ethereum L2 solution Arbitrum, I have saved Ξ${info.arbitrum.feesSavedEther} worth $${info.arbitrum.feesSavedUSD} and had my transactions instantly confirmed.`;
        } else {
          tweet = `By using Ethereum L2 solution Optimism, I have saved Ξ${info.optimism.feesSavedEther} worth $${info.optimism.feesSavedUSD} and had my transactions instantly confirmed.`;
        }
        break;
      case 8:
        if (parseInt(info.zksync.txCount !== 0)) {
          tweet = `By using Ethereum L2 solution Arbitrum, I have saved Ξ${info.zksync.feesSavedEther} worth $${info.zksync.feesSavedUSD} and had my transactions instantly confirmed.`;
        } else {
          tweet = `L2's make Ethereum usable again. I've saved $${info.general.L1feesUSD} by using L2's, while having instant confirmations and Ethereum Mainnet's security and decentralization.`;
        }
        break;
      case 9:
        tweet = `My L2 transactions have saved me $${info.general.L1feesUSD}, while being as secure and decentralized as Ethereum Mainnet.`;
        break;
      default:
        //
        break;
    }
    tweet +=
      " See how much fees you saved by using Ethereum L2's on l2savings.org. @L2savings";
    return encodeURIComponent(tweet);
  };

  const etherPrice = async () => {
    const oracle = new ethers.Contract(
      // Chainlink ETH/USD Oracle Address
      "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      oracleAbi(),
      // Attach provider
      new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth")
    );
    const response = await oracle.latestAnswer();
    return parseFloat(response) / 100000000;
  };

  const gasPrice = async () => {
    const oracle = new ethers.Contract(
      // Chainlink Fast-Gas Oracle Address
      "0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C",
      oracleAbi(),
      // Attach provider
      new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth")
    );
    const response = await oracle.latestAnswer();
    return toGwei(response);
  };

  // Rounds any unix timestamp to the
  // nearest day and returns the average
  // gas price. If no recent timestamp
  // is found returns 110 gwei.
  const averageDailyGas = timestamp => {
    timestamp = timestamp - (timestamp % 86400); // seconds per day
    return historicalGasPrices[timestamp] || 110000000000; // 110 gwei
  };

  // On index 2071713 Optimism
  // reduced the L1fee scalar from 1.5
  // to 1.24.
  // https://optimistic.etherscan.io/tx/2071713
  // Optimism is EVM equivalent, but for the sake
  // of better variable names, OVM can stay.
  const getOVML1FeeScalar = index => {
    if (index <= 2071713) {
      return 1.5;
    }
    return 1.24;
  };

  // on index 2071714 Optimism
  // reduced the overhead from 2750
  // to 2100.
  // https://optimistic.etherscan.io/tx/2071714
  const getOVMOverhead = index => {
    if (index <= 2071714) {
      return 2750;
    }
    return 2100;
  };

  // Implementation of getL1GasUsed() from
  // Solidity, OVM Gas Price Oracle.
  // Deployed on Optimism at address
  // 0x420000000000000000000000000000000000000F
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
    // On-chain Retrieval:
    //
    // import * as optimismContracts from "@eth-optimism/contracts";
    // const gasPriceOracle = optimismContracts
    // .getContractFactory("OVM_GasPriceOracle")
    // .attach(optimismContracts.predeploys.OVM_GasPriceOracle)
    // .connect(provider);
    // await gasPriceOracle.getL1GasUsed(serializedTx);
  };

  // L2 gas price is usually (according to Arbitrum)
  // 100 times less than the L1 gas price.
  // So L1 gas is 100 * L2 gas.
  // Note that this might be changed as
  // Arbitrum is upgraded.
  const avmL1GasScalar = (L2GasPrice, blockNum) => {
    return L2GasPrice * 100;
  };

  // Create a blockies identicon as
  // seen in Etherscan or other dapps
  const createBlockiesIdenticon = addr => {
    return createIcon({
      seed: addr.toLowerCase(),
      size: 8,
      scale: 16,
    }).toDataURL("image/png");
  };

  const getOptimismInfo = async () => {
    //
    const response = await fetch(
      `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${account.address}&sort=desc&apikey=AUK6ZKXZXDDFJ5MYY8G287Z9D4D57SYVF8`
    );

    const data = await response.json();

    let feesPaid = 0;
    let gasUsed = 0;
    let feesIfOnMainnet = 0;
    let txCount = 0;
    for (const tx of data.result) {
      //
      if (tx.from.toLowerCase() === account.address.toLowerCase()) {
        //
        const serialized = ethers.utils.serializeTransaction({
          // Eslint does not recognize BigInt
          nonce: parseInt(tx.nonce, 16),
          // eslint-disable-next-line no-undef
          gasPrice: BigInt(tx.gasPrice, 16),
          // eslint-disable-next-line no-undef
          gasLimit: BigInt(tx.gasUsed, 16),
          to: tx.to,
          // eslint-disable-next-line no-undef
          value: BigInt(tx.value, 16),
          data: tx.input,
        });

        const L2GasPrice = tx.gasPrice;
        const L2GasUsed = tx.gasUsed;
        const L1GasLimit = ovmL1GasUsed(serialized, tx.blockNumber);
        const L1GasPrice = averageDailyGas(parseInt(tx.timeStamp));
        const feeScalar = getOVML1FeeScalar(tx.blockNumber);

        feesPaid +=
          L2GasUsed * L2GasPrice + L1GasLimit * L1GasPrice * feeScalar;
        gasUsed += parseInt(tx.gasUsed);
        // Optimism is Ethereum equivalent. Ethereum Mainnet gas
        // spent would be approximately the same.
        feesIfOnMainnet += L2GasUsed * L1GasPrice;
        txCount++;
      }
    }

    return {
      feesPaid: toEther(feesPaid),
      gasUsed: gasUsed,
      feesIfOnMainnet: toEther(feesIfOnMainnet),
      transactionCount: txCount,
    };
    //
  };

  // I haven't found an accurate way to
  // convert arbgas to Ethereum Mainnet gas yet.
  // This function returns the accurate amount of
  // ether paid for the TX, but an estimated
  // total gas used.
  //
  // From my understanding eth_estimateGas will
  // throw an error if the address doesn't have
  // sufficient balance on Ethereum Mainnet.
  //
  // If you know a better way to convert arbgas
  // to L1 gas, please open an issue or contact
  // me. Thanks!
  const getArbitrumInfo = async () => {
    //
    const response = await fetch(
      `https://api.arbiscan.io/api?module=account&action=txlist&address=${account.address}&sort=desc&apikey=8PZFKWRJSCDH5SEJ6QP2DTM2QN6DK2Q1UV`
    );

    const data = await response.json();

    let feesPaid = 0;
    let arbgasUsed = 0;
    let gasUsed = 0;
    let feesIfOnMainnet = 0;
    let txCount = 0;
    for (const tx of data.result) {
      if (tx.from.toLowerCase() === account.address.toLowerCase()) {
        // Arbiscan api returns the gas price bid and not the
        // actual gas price paid. On average actual gas price
        // paid is 0.27 gwei less. (from my observations)
        const L2Gas = parseInt(tx.gasUsed);
        const L2GasPrice = parseInt(tx.gasPrice) - 270000000;
        const L1GasPrice = avmL1GasScalar(L2GasPrice, tx.timeStamp);

        const feePaid = L2GasPrice * L2Gas;

        // Usually +- 10% uncertainty
        // Compared ETH transfers, ERC20 approval costs
        // and ran contracts manually on remix javascript fork
        // to compare arbgas to regular gas.
        const gasIfOnMainnet = Math.round(
          L2Gas / ((L1GasPrice / (100000000000 + L2GasPrice * 1.45)) * 12)
        );

        feesPaid += feePaid;
        arbgasUsed += L2Gas;
        gasUsed += gasIfOnMainnet;
        feesIfOnMainnet += gasIfOnMainnet * L1GasPrice;
        txCount++;
      }
    }

    return {
      feesPaid: toEther(feesPaid),
      gasUsed: gasUsed,
      arbgasUsed: arbgasUsed,
      feesIfOnMainnet: toEther(feesIfOnMainnet),
      transactionCount: txCount,
    };
  };

  // ZkSync has "types" of transactions
  // Each type of transaction returns different information.
  const getZkSyncInfo = async () => {
    // TODO: Add support for 100+ transactions
    // Possible implementation:
    // let latest = "latest", if transaction count > 100 latest = 100 and refetch

    let from = "latest";
    const allData = [];
    let fetchedTxCount = 0;
    let firstTxDate = 0;
    let lastTxDate = 0;
    // supporting maximum 1000 transactions
    // otherwise loading times will be too much
    const MAX_SUPPORTED_TRANSACTIONS = 1000;
    while (fetchedTxCount < MAX_SUPPORTED_TRANSACTIONS) {
      //
      //
      const response = await fetch(
        `https://api.zksync.io/api/v0.2/accounts/${account.address}/transactions?from=${from}&limit=100&direction=older`
      );

      const data = await response.json();

      if (data.result.list.length === 0) {
        // No transactions on ZkSync
        return {
          feesPaid: 0,
          L1GasPredicted: 0,
          nativeGasPredicted: 0,
          feesIfOnMainnet: 0,
          transactionCount: 0,
        };
      }

      // .at(-1) not supported on mobile
      const lastElementIndex = data.result.list.length - 1;
      //
      //
      firstTxDate =
        Math.round(
          new Date(data.result.list[lastElementIndex].createdAt).getTime() /
            1000
        ) - 86400; // subtract 1 day to be safe
      //
      //
      //
      if (lastTxDate === 0) {
        lastTxDate =
          Math.round(new Date(data.result.list[0].createdAt).getTime() / 1000) +
          86400; // add 1 day to be safe
      }
      //
      //
      allData.push(data.result.list);

      if (data.result.list.length === 100) {
        from = data.result.list[lastElementIndex].txHash;
        fetchedTxCount += 100;
      } else {
        break;
      }
    }

    const eth_priceDataResponse = await fetch(
      `https://poloniex.com/public?command=returnChartData&currencyPair=USDT_ETH&start=${firstTxDate}&end=${lastTxDate}&period=14400`
    );

    const ETH_RESPONSE_DATA = await eth_priceDataResponse.json();

    // Starting from Wednesday, First TX Date, 4 Hourly Data
    const ETHUSD_DATA = Object.fromEntries(
      ETH_RESPONSE_DATA.map(obj => [obj.date, obj.close])
    );

    const currentEtherPrice = await etherPrice();

    // ZkSync allows users to pay in multiple tokens.
    // The API returns the "token ID". This function
    // returns given token ID amount and date to Ether.
    // Average daily ETH price data is used unless the
    // date is not found, in which the current ETH price
    // of the asset is returned.
    // https://zkscan.io/explorer/tokens/
    const zkSyncFees = (tokenId, fee, timestamp, isExpensive) => {
      // fee should be in ether, not wei.
      if (tokenId === 0) {
        return fee;
      }
      // convert timestamp to the nearest 4 hour'th data
      timestamp = timestamp - (timestamp % 14400); // 4 hours
      const ETH_USD = ETHUSD_DATA[timestamp] || currentEtherPrice;
      // Both NFT, ERC20 and Ether transfers are classified
      // under the "transfer" function type.
      // if id = 0, it's an ether transfer
      // If the id is in token ID's, it's a token
      // otherwise it's an nft.
      // NFT token id's are usually "big" ~6.
      // The biggest token ID as of now is 149.
      // To avoid fetching https://api.zksync.io/api/v0.2/tokens/<id>
      // each time to check whether a transfer is an NFT transfer
      // or not, just an ID size check can be used.
      // If this becomes an issue later when more tokens are added,
      // it can always be solved easily.
      if (tokenId <= 6 || tokenId >= 500) {
        // Token ID <= 6 all stables
        if (tokenId === 2 || tokenId === 4) {
          fee *= 10 ** 12; // USDC and USDT has 6 decimal places
        }
        return fee / ETH_USD;
      }
      //
      // If fees are paid with an unknown token id
      if (isExpensive) {
        console.log(
          `Warning: fees paid in unsupported token ID ${tokenId} for ZkSync. Assumed 0.002Ξ TX Fee`
        );
        return 0.002;
      }
      console.log(
        `Warning: fees paid in unsupported token ID ${tokenId} for ZkSync. Assumed 0.0002Ξ TX Fee`
      );
      return 0.0002;
    };

    // ZkSync has different types of transactions.
    // It is not possible (as far as I know) to convert
    // the ZkSync fee spent to L1 gas.
    // This is a guess of how much the transaction type
    // would cost on average if it was sent on L1.
    //
    // Native gas calculated by using zkScan's
    // estimated cost of transfer and interactions.
    const ZkSyncGasMap = {
      // nativeGasSpent: 35731,
      // L1gasSpent: 3573100,
      //
      // ChangePubKey L1GasSpent is zero because
      // it is a requirement to use ZkSync.
      // The user wouldn't have to perform this
      // operation if they were on L1.
      //
      // Simple wording: Initial cost to create
      // ZkSync account is not counted as "savings",
      // but a loss.
      ChangePubKey: {
        nativeGasSpent: 35731,
        L1gasSpent: 0,
      },
      Swap: {
        nativeGasSpent: 2350,
        L1gasSpent: 160000, // average uniswap swap gas
      },
      ETHTransfer: {
        nativeGasSpent: 1045,
        L1gasSpent: 21000,
      },
      ERC20Transfer: {
        nativeGasSpent: 1045,
        L1gasSpent: 65000,
      },
      MintNFT: {
        nativeGasSpent: 2874,
        L1gasSpent: 150000, // estimated average
      },
      // ForcedExit: {
      //   nativeGasSpent: 37189,
      //   L1gasSpent: 0,
      // },
      // WithdrawNFT: {
      //   nativeGasSpent: 72390,
      //   L1gasSpent: 0, // estimated average
      // },
      // Withdraw: {
      //   nativeGasSpent: 72390,
      //   L1gasSpent: 0,
      // },
      // Deposit: {
      //   nativeGasSpent: 0,
      //   L1gasSpent: 0,
      // },
    };

    // "Transactions" that won't be taken
    // into account as a transaction.
    const irrelevantTransactions = new Set([
      "Deposit",
      "Withdraw",
      "WithdrawNFT",
      "ForcedExit",
    ]);
    //
    //

    let feesPaid = 0;
    let L1GasPredicted = 0;
    let nativeGasPredicted = 0;
    let feesIfOnMainnet = 0;
    let txCount = 0;

    for (const data of allData) {
      //
      //
      for (const tx of data) {
        //
        //
        const op = tx.op;

        let feeToken = op.feeToken || 0;
        const txTimestamp = Math.round(new Date(tx.createdAt).getTime() / 1000);
        const avgDailyGas = averageDailyGas(txTimestamp);
        let type = op.type;

        if (irrelevantTransactions.has(type)) {
          txCount++;
          continue;
          //
        } else if (
          type === "Transfer" &&
          op.from.toLowerCase() === account.address.toLowerCase()
        ) {
          //
          feeToken = feeToken || tx.op.token;
          type = op.token === 0 ? "ETHTransfer" : "ERC20Transfer";
          // The "isBatch" variable may have a misleading name.
          // isBatch variable eliminates transactions that may
          // have been included in a batch.
          const isBatch = toEther(op.fee) === 0 ? true : false;

          feesPaid += zkSyncFees(feeToken, toEther(op.fee), txTimestamp);
          // include batch gas
          // if not in batch transaction
          if (!isBatch) {
            nativeGasPredicted += ZkSyncGasMap[type].nativeGasSpent;
            L1GasPredicted += ZkSyncGasMap[type].L1gasSpent;
            feesIfOnMainnet += toEther(
              ZkSyncGasMap[type].L1gasSpent * avgDailyGas
            );
            txCount += 1;
          }
          //
          //
        } else if (type === "Swap") {
          //
          //
          feesPaid += zkSyncFees(feeToken, toEther(op.fee), txTimestamp);
          nativeGasPredicted += ZkSyncGasMap[type].nativeGasSpent;
          L1GasPredicted += ZkSyncGasMap[type].L1gasSpent;
          feesIfOnMainnet += toEther(
            ZkSyncGasMap[type].L1gasSpent * avgDailyGas
          );
          txCount++;
          //
          //
        } else if (type === "MintNFT") {
          //
          //
          feesPaid += zkSyncFees(feeToken, toEther(op.fee), txTimestamp);
          nativeGasPredicted += ZkSyncGasMap[type].nativeGasSpent;
          L1GasPredicted += ZkSyncGasMap[type].L1gasSpent;
          txCount++;
          //
          //
        } else if (type === "ChangePubKey") {
          //
          //
          feesPaid += zkSyncFees(feeToken, toEther(op.fee), txTimestamp, true);
          nativeGasPredicted += ZkSyncGasMap[type].nativeGasSpent;
          L1GasPredicted += ZkSyncGasMap[type].L1gasSpent;
          txCount++;
          //
          //
        }
      }
    }

    return {
      feesPaid: feesPaid,
      L1GasPredicted: Math.round(L1GasPredicted),
      nativeGasPredicted: nativeGasPredicted,
      feesIfOnMainnet: feesIfOnMainnet,
      transactionCount: txCount,
    };
  };

  const getInfo = async () => {
    //
    //
    const data = {
      ovm: await getOptimismInfo(),
      avm: await getArbitrumInfo(),
      zkevm: await getZkSyncInfo(),
    };
    //
    //
    const ETHUSD = await etherPrice();
    const currentGas = await gasPrice();

    const L2FeesEther =
      data.ovm.feesPaid + data.avm.feesPaid + data.zkevm.feesPaid;
    const L1FeesEther =
      data.ovm.feesIfOnMainnet +
      data.avm.feesIfOnMainnet +
      data.zkevm.feesIfOnMainnet;

    const fixFormat = (n, y) => {
      return parseFloat(n.toFixed(y));
    };

    const generalTimesCheaper = fixFormat(L1FeesEther / L2FeesEther, 2);
    const ovmTimesCheaper = fixFormat(
      data.ovm.feesIfOnMainnet / data.ovm.feesPaid,
      2
    );
    const avmTimesCheaper = fixFormat(
      data.avm.feesIfOnMainnet / data.avm.feesPaid,
      2
    );
    const zkevmTimesCheaper = fixFormat(
      data.zkevm.feesIfOnMainnet / data.zkevm.feesPaid,
      2
    );

    // This looks complicated. I'm aware of it.
    // I don't know if there is a clean way to do this.
    // Looping and adding variables wont work, because
    // each key has a different purpose.
    return {
      general: {
        L1FastGasPrice: currentGas,
        txCount:
          data.ovm.transactionCount +
          data.avm.transactionCount +
          data.zkevm.transactionCount,
        gasSpent:
          data.ovm.gasUsed + data.avm.gasUsed + data.zkevm.L1GasPredicted,
        nativeGasSpent: data.ovm.gasUsed + data.avm.arbgasUsed, // +
        // data.zkevm.nativeGasPredicted,
        L2feesEther: fixFormat(L2FeesEther, 4),
        L2feesUSD: fixFormat(L2FeesEther * ETHUSD, 2),
        L1feesEther: fixFormat(L1FeesEther, 4),
        L1feesUSD: fixFormat(L1FeesEther * ETHUSD, 2),
        feesSavedEther: fixFormat(L1FeesEther - L2FeesEther, 4),
        feesSavedUSD: fixFormat((L1FeesEther - L2FeesEther) * ETHUSD, 2),
        timesCheaper: isNaN(generalTimesCheaper) ? 1 : generalTimesCheaper,
        etherPrice: fixFormat(ETHUSD, 2),
        time: Date.now(),
      },
      optimism: {
        txCount: data.ovm.transactionCount,
        gasSpent: data.ovm.gasUsed,
        nativeGasSpent: data.ovm.gasUsed,
        L1feesEther: fixFormat(data.ovm.feesIfOnMainnet, 4),
        L1feesUSD: fixFormat(data.ovm.feesIfOnMainnet * ETHUSD, 2),
        L2feesEther: fixFormat(data.ovm.feesPaid, 4),
        L2feesUSD: fixFormat(data.ovm.feesPaid * ETHUSD, 2),
        feesSavedEther: fixFormat(
          data.ovm.feesIfOnMainnet - data.ovm.feesPaid,
          4
        ),
        feesSavedUSD: fixFormat(
          (data.ovm.feesIfOnMainnet - data.ovm.feesPaid) * ETHUSD,
          2
        ),
        timesCheaper: isNaN(ovmTimesCheaper) ? 1 : ovmTimesCheaper,
      },
      arbitrum: {
        txCount: data.avm.transactionCount,
        gasSpent: data.avm.gasUsed,
        nativeGasSpent: data.avm.arbgasUsed,
        L1feesEther: fixFormat(data.avm.feesIfOnMainnet, 4),
        L1feesUSD: fixFormat(data.avm.feesIfOnMainnet * ETHUSD, 2),
        L2feesEther: fixFormat(data.avm.feesPaid, 4),
        L2feesUSD: fixFormat(data.avm.feesPaid * ETHUSD, 2),
        feesSavedEther: fixFormat(
          data.avm.feesIfOnMainnet - data.avm.feesPaid,
          4
        ),
        feesSavedUSD: fixFormat(
          (data.avm.feesIfOnMainnet - data.avm.feesPaid) * ETHUSD,
          2
        ),
        timesCheaper: isNaN(avmTimesCheaper) ? 1 : avmTimesCheaper,
      },
      zksync: {
        txCount: data.zkevm.transactionCount,
        gasSpent: data.zkevm.L1GasPredicted,
        nativeGasSpent: data.zkevm.nativeGasPredicted,
        L1feesEther: fixFormat(data.zkevm.feesIfOnMainnet, 4),
        L1feesUSD: fixFormat(data.zkevm.feesIfOnMainnet * ETHUSD, 2),
        L2feesEther: fixFormat(data.zkevm.feesPaid, 4),
        L2feesUSD: fixFormat(data.zkevm.feesPaid * ETHUSD, 2),
        feesSavedEther: fixFormat(
          data.zkevm.feesIfOnMainnet - data.zkevm.feesPaid,
          4
        ),
        feesSavedUSD: fixFormat(
          (data.zkevm.feesIfOnMainnet - data.zkevm.feesPaid) * ETHUSD,
          2
        ),
        timesCheaper: isNaN(zkevmTimesCheaper) ? 1 : zkevmTimesCheaper,
      },
    };
  };

  // Get ENS address and ENS avatar
  const fetchMetadata = async () => {
    //
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth"
    );

    const ENS = await provider.lookupAddress(account.address);
    let profilePhoto;
    if (ENS) {
      // don't wait for avatar to fetch
      setAccount({
        address: account.address,
        ENS: ENS,
        displayAddress: ENS,
        profilePhoto: account.profilePhoto,
      });
      const avatar = await provider.getAvatar(ENS);
      profilePhoto = avatar || createBlockiesIdenticon(account.address);
    } else {
      profilePhoto = createBlockiesIdenticon(account.address);
    }

    setAccount({
      address: account.address,
      ENS: ENS,
      displayAddress: ENS || account.displayAddress,
      profilePhoto: profilePhoto,
    });
    //
  };

  // Connect wallet and set address
  const connectWallet = async type => {
    // Connect using Metamask
    if (type === "metamask") {
      if (window.ethereum) {
        // request accounts from Metamask
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const address = ethers.utils.getAddress(accounts[0]);

        setAccount({
          address: address,
          ENS: null,
          displayAddress: shorten(address),
          // initally set the profile photo as blockies identicon
          // later fetch metadata to see if the address has
          // ENS avatar.
          profilePhoto: createBlockiesIdenticon(address),
        });
        localStorage.setItem("connectionType", "metamask");
      } else {
        alert("Metamask or injected provider not found.");
      }
      setConnectWalletClicked(false);
    }
    if (type === "walletconnect") {
      const provider = new WalletConnectProvider();

      try {
        await provider.enable();
      } catch {
        return;
        // Rejected walletconnect request
      }

      // store the old window.ethereum if
      // the user has injected provider
      window.oldEthereum = window.ethereum;

      // EIP-1193 compatible
      // can be used to listen to events
      // the same way as Metamask
      window.ethereum = provider;

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = ethers.utils.getAddress(accounts[0]);

      setAccount({
        address: address,
        ENS: null,
        displayAddress: shorten(address),
        // initally set the profile photo as blockies identicon
        // later fetch metadata to see if the address has
        // ENS avatar.
        profilePhoto: createBlockiesIdenticon(address),
      });
      localStorage.setItem("connectionType", "walletconnect");
      setConnectWalletClicked(false);
    }
  };

  // Listen to wallet disconnects/account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts => {
        setAccount({
          address: null,
          ENS: null,
          displayAddress: null,
          profilePhoto: null,
        });
        setInfo(emptyInfo());
        if (accounts.length === 0) {
          localStorage.removeItem("connectionType");
        } else {
          connectWallet(localStorage.getItem("connectionType"));
        }
      });
      window.ethereum.on("disconnect", () => {
        setAccount({
          address: null,
          ENS: null,
          displayAddress: null,
          profilePhoto: null,
        });
        setInfo(emptyInfo());
        localStorage.removeItem("connectionType");
        if (window.oldEthereum) {
          // restore injected provider
          window.ethereum = window.oldEthereum;
        }
      });
    }
  });

  // On App load
  useEffect(() => {
    const connectionType = localStorage.getItem("connectionType");
    if (connectionType) {
      connectWallet(connectionType);
    }
    // eslint-disable-next-line
  }, []);

  // On address change
  useEffect(() => {
    if (account.address) {
      fetchMetadata();
      getInfo().then(_info => {
        window.downloadData = encodeURIComponent(JSON.stringify(_info));
        serialLocalization(_info);
        setInfo(_info);
      });
    }
    // eslint-disable-next-line
  }, [account.address]);

  return (
    <div id="main">
      {/* */}
      <nav>
        <div className="left-info">
          <div className="logo">
            <img src={l2savings} alt="L2Savings logo"></img>
            <span>
              <p>L2Savings</p>
            </span>
          </div>
          <div className="gasprice-container">
            <span className="gasprice">
              <p>
                L1 Fast Gas: <span>{info.general.L1FastGasPrice}</span> gwei
              </p>
            </span>
          </div>
        </div>

        <div className="right-info">
          <div className="walletcontainer" ref={walletContainerRef}>
            {connectWalletClicked ? (
              <div className="walletcontainer">
                <Buttonish
                  text={"WalletConnect"}
                  onClick={() => {
                    connectWallet("walletconnect");
                  }}
                  img={walletconnectlogo}
                  alt={"Walletconnect logo"}
                  imgSize={{ height: "32px", width: "32px" }}
                />
                <Buttonish
                  text="Metamask"
                  onClick={() => {
                    connectWallet("metamask");
                  }}
                  img={metamasklogo}
                  alt={"Metamask logo"}
                />
              </div>
            ) : (
              <Buttonish
                text={account.displayAddress || "Connect Wallet"}
                onClick={() => {
                  if (!account.address) {
                    setConnectWalletClicked(true);
                  }
                }}
                img={account.profilePhoto || createBlockiesIdenticon("1984")}
                alt={"Avatar"}
                showCircularBG={true}
              />
            )}
          </div>

          <Dropper
            text={"Bridge To L2's"}
            names={[
              "Hop Bridge",
              "Optimistic Gateway",
              "Arbitrum Bridge",
              "ZkSync Wallet",
            ]}
            urls={[
              "https://hop.exchange/",
              "https://gateway.optimism.io/",
              "https://bridge.arbitrum.io/",
              "https://wallet.zksync.io/",
            ]}
          />

          {info.general.L2feesEther !== "..." ? (
            <div className="stats">
              <Buttonish
                text={"Download Stats"}
                noWrap={true}
                isAnchor={true}
                href={"data:text/json;charset=utf-8," + window.downloadData}
                download={
                  account.displayAddress
                    ? account.ENS
                      ? `${account.ENS}_L2Savings.json`
                      : `${account.address}_L2Savings.json`
                    : null
                }
              />
              <Buttonish
                text={"Tweet Stats"}
                noWrap={true}
                isAnchor={true}
                onClick={() => {
                  setRandomTweet(generateTweet());
                }}
                img={twitterlogo}
                imgSize={{ height: "36px", width: "28px" }}
                alt={"Twitter Logo"}
                href={"https://twitter.com/intent/tweet?text=" + randomTweet}
                newTab={true}
              />
            </div>
          ) : null}
        </div>
      </nav>

      <div className="infocontainer">
        <div className="chains">
          <Buttonish
            text={"All L2's"}
            noWrap={true}
            onClick={() => {
              unclick();
              setShowAllChains(true);
            }}
            img={l2sgradient}
            imgSize={{ height: "32px", width: "32px" }}
            alt={"All L2's Gradient"}
            showCircularBG={true}
            extraProperty={"pad"}
          />

          <Buttonish
            text={"Optimism"}
            onClick={() => {
              unclick();
              setShowOptimism(true);
            }}
            img={optimism}
            alt={"Optimism Icon"}
            showCircularBG={true}
            extraProperty={"pad"}
          />

          <Buttonish
            text={"Arbitrum"}
            onClick={() => {
              unclick();
              setShowArbitrum(true);
            }}
            img={arbitrum}
            alt={"Arbitrum Icon"}
            extraProperty={"pad"}
          />

          <Buttonish
            text={"ZkSync"}
            onClick={() => {
              unclick();
              setShowZkSync(true);
            }}
            img={zksync}
            imgSize={{ height: "18px" }}
            alt={"ZkSync Icon"}
            extraProperty={"pad"}
            imgExtraClass={"zksync"}
          />
        </div>

        <div className="maintext">
          {showAllChains ? (
            <InfoText
              textColor={"#47bf61"}
              mainColor={"#5fea31"}
              txCount={info.general.txCount}
              chainName={"All L2's"}
              nativeGasSpent={info.general.nativeGasSpent}
              L2feesEther={info.general.L2feesEther}
              L2feesUSD={info.general.L2feesUSD}
              gasSpent={info.general.gasSpent}
              L1feesEther={info.general.L1feesEther}
              L1feesUSD={info.general.L1feesUSD}
              feesSavedEther={info.general.feesSavedEther}
              feesSavedUSD={info.general.feesSavedUSD}
              timesCheaper={info.general.timesCheaper}
            />
          ) : null}

          {showOptimism ? (
            <InfoText
              textColor={"#bf4747"}
              mainColor={"#ea3431"}
              txCount={info.optimism.txCount}
              chainName={"Optimism"}
              nativeGasSpent={info.optimism.nativeGasSpent}
              L2feesEther={info.optimism.L2feesEther}
              L2feesUSD={info.optimism.L2feesUSD}
              gasSpent={info.optimism.gasSpent}
              L1feesEther={info.optimism.L1feesEther}
              L1feesUSD={info.optimism.L1feesUSD}
              feesSavedEther={info.optimism.feesSavedEther}
              feesSavedUSD={info.optimism.feesSavedUSD}
              timesCheaper={info.optimism.timesCheaper}
            />
          ) : null}

          {showArbitrum ? (
            <InfoText
              textColor={"#4e82ea"}
              mainColor={"#4e9fea"}
              txCount={info.arbitrum.txCount}
              chainName={"Arbitrum"}
              nativeGasSpent={info.arbitrum.nativeGasSpent}
              L2feesEther={info.arbitrum.L2feesEther}
              L2feesUSD={info.arbitrum.L2feesUSD}
              gasSpent={info.arbitrum.gasSpent}
              L1feesEther={info.arbitrum.L1feesEther}
              L1feesUSD={info.arbitrum.L1feesUSD}
              feesSavedEther={info.arbitrum.feesSavedEther}
              feesSavedUSD={info.arbitrum.feesSavedUSD}
              timesCheaper={info.arbitrum.timesCheaper}
            />
          ) : null}

          {showZkSync ? (
            <InfoText
              textColor={"#6e73b8"}
              mainColor={"#4e5395"}
              txCount={info.zksync.txCount}
              chainName={"ZkSync"}
              nativeGasSpent={"?"}
              L2feesEther={info.zksync.L2feesEther}
              L2feesUSD={info.zksync.L2feesUSD}
              gasSpent={info.zksync.gasSpent}
              L1feesEther={info.zksync.L1feesEther}
              L1feesUSD={info.zksync.L1feesUSD}
              feesSavedEther={info.zksync.feesSavedEther}
              feesSavedUSD={info.zksync.feesSavedUSD}
              timesCheaper={info.zksync.timesCheaper}
            />
          ) : null}
        </div>
      </div>
      <footer>
        <div className="leftbottom">
          <div>
            <p className="disclaimer">
              Made possible by Etherscan & ZkSync API's.
            </p>
            <p className="disclaimer">
              Data is provided as is, with no guarantee of accuracy. Expect up
              to 10% inaccuracy.
            </p>
          </div>
        </div>
        <div className="rightbottom">
          <div className="socials">
            <Buttonish
              text={"Github"}
              isAnchor={true}
              img={githublogo}
              href={"https://github.com/bbayazit16/L2Savings"}
              newTab={true}
              showCircularBG={true}
            />
            <Buttonish
              text={"Follow Us On Twitter"}
              isAnchor={true}
              img={twitterlogo}
              imgSize={{ height: "36px", width: "28px" }}
              href={"https://twitter.com/L2Savings"}
              newTab={true}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
