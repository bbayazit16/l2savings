import "./InfoText.css";
import PropTypes from "prop-types";

const InfoText = ({
  textColor,
  mainColor,
  txCount,
  chainName,
  nativeGasSpent,
  L2feesEther,
  L2feesUSD,
  gasSpent,
  L1feesEther,
  L1feesUSD,
  feesSavedEther,
  feesSavedUSD,
  timesCheaper,
}) => {
  return (
    <>
      <p>
        You have sent <span style={{ color: textColor }}>{txCount}</span>{" "}
        transactions on <span style={{ color: mainColor }}>{chainName}</span>{" "}
        and spent
        <span style={{ color: textColor }}> {nativeGasSpent} </span>
        gas. This cost you{" "}
        <span style={{ color: textColor }}>
          <span className="ethericon">Ξ</span>
          {L2feesEther}
        </span>
        , worth <span style={{ color: textColor }}>${L2feesUSD}</span> now.{" "}
        {timesCheaper !== "..." ? "😁" : "😴"}
      </p>
      <p>
        If you sent these transactions on{" "}
        <span style={{ color: "#6872ab" }}>Ethereum Mainnet</span>, it would
        cost <span style={{ color: textColor }}>{gasSpent}</span> gas and{" "}
        <span style={{ color: textColor }}>
          <span className="ethericon">Ξ</span>
          {L1feesEther}
        </span>{" "}
        in transaction fees, worth{" "}
        <span style={{ color: textColor }}>${L1feesUSD}</span> now.{" "}
        {timesCheaper !== "..." ? "😮" : "😴"}
      </p>
      <p>
        You saved{" "}
        <span className="shockinginfo">
          <span className="ethericon">Ξ</span>
          {feesSavedEther}
        </span>{" "}
        in fees, worth <span className="shockinginfo">${feesSavedUSD}</span>{" "}
        now. That's <span className="shockinginfo">{timesCheaper}x</span>{" "}
        cheaper! {timesCheaper !== "..." ? "🤯" : "😴"}
      </p>
    </>
  );
};

InfoText.propTypes = {
  textColor: PropTypes.string.isRequired,
  mainColor: PropTypes.string.isRequired,
  txCount: PropTypes.string.isRequired,
  chainName: PropTypes.string.isRequired,
  nativeGasSpent: PropTypes.string.isRequired,
  L2feesEther: PropTypes.string.isRequired,
  L2feesUSD: PropTypes.string.isRequired,
  gasSpent: PropTypes.string.isRequired,
  L1feesEther: PropTypes.string.isRequired,
  L1feesUSD: PropTypes.string.isRequired,
  feesSavedEther: PropTypes.string.isRequired,
  feesSavedUSD: PropTypes.string.isRequired,
  timesCheaper: PropTypes.string.isRequired,
};

export default InfoText;
