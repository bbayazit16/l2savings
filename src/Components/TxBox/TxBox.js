import "./TxBox.css";
import PropTypes from "prop-types";

const TxBox = ({ img, txObj }) => {
  //
  //
  const txHash = txObj.txHash;
  //
  //
  const txSubstr =
    txHash.substring(0, 6) + "..." + txHash.substring(txHash.length - 4);
  //
  //
  return (
    <div className="txbox">
      <div className="txbox-img-container centered">
        <img src={img} alt="TxBox Chain Icon"></img>
      </div>
      <div className="tx-hash centered">
        <a href={txObj.txBaseURI + txHash} target="_blank" rel="noreferrer">
          <small>{txSubstr}</small>
        </a>
      </div>
      <div className="txbox-feespaid centered">
        <p>
          <small>{txObj.feesPaid}</small>
          <small className="ethericon">Ξ</small>
        </p>
      </div>
      <div className="txbox-feespaid centered">
        <small>{txObj.feeIfOnL1}</small>
        <small className="ethericon">Ξ</small>
      </div>
      <div className="txbox-feespaid centered">
        <small>{txObj.feeSaved}</small>
        <small className="ethericon">Ξ</small>
      </div>
      <div className="txbox-feespaid centered">
        <span>
          <small className="shocking">{txObj.savingsMultiplier}x</small>
        </span>
      </div>
    </div>
  );
};

TxBox.propTypes = {
  img: PropTypes.any.isRequired,
  txObj: PropTypes.object.isRequired,
};

export default TxBox;
