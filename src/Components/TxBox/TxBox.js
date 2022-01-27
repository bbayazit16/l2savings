import "./TxBox.css";
import PropTypes from "prop-types";

const TxBox = ({
  img,
  txBaseURI,
  txHash,
  feesPaid,
  feeIfOnL1,
  feeSaved,
  savingsMultiplier,
}) => {
  const txSubstr =
    txHash.substring(0, 6) + "..." + txHash.substring(txHash.length - 4);

  return (
    <div className="txbox">
      <div className="txbox-img-container centered">
        <img src={img} alt="TxBox Chain Icon"></img>
      </div>
      <div className="tx-hash centered">
        <a href={txBaseURI + txHash} target="_blank" rel="noreferrer">
          <small>{txSubstr}</small>
        </a>
      </div>
      <div className="txbox-feespaid centered">
        <p>
          <small>{feesPaid}</small>
          <small className="ethericon">Ξ</small>
        </p>
      </div>
      <div className="txbox-feespaid centered">
        <small>{feeIfOnL1}</small>
        <small className="ethericon">Ξ</small>
      </div>
      <div className="txbox-feespaid centered">
        <small>{feeSaved}</small>
        <small className="ethericon">Ξ</small>
      </div>
      <div className="txbox-feespaid centered">
        <span>
          <small className="shocking">{savingsMultiplier}x</small>
        </span>
      </div>
    </div>
  );
};

TxBox.propTypes = {
  img: PropTypes.any.isRequired,
  txBaseURI: PropTypes.string.isRequired,
  txHash: PropTypes.string.isRequired,
  feesPaid: PropTypes.number.isRequired,
  feeIfOnL1: PropTypes.number.isRequired,
  feeSaved: PropTypes.number.isRequired,
  savingsMultiplier: PropTypes.number.isRequired,
};

export default TxBox;
