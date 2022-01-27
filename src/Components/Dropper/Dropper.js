import "./Dropper.css";
import Buttonish from "../Buttonish/Buttonish";
import PropTypes from "prop-types";

const Dropper = ({ text, names, urls }) => {
  return (
    <div className="dropbutton">
      <Buttonish text={text} noWrap={true} className="dropmenu" />
      <div className="dropcontent">
        {names.map((_, index) => {
          return (
            <Buttonish
              text={names[index]}
              isAnchor={true}
              href={urls[index]}
              newTab={true}
              key={index}
            />
          );
        })}
      </div>
    </div>
  );
};

Dropper.propTypes = {
  text: PropTypes.string.isRequired,
  names: PropTypes.array.isRequired,
  urls: PropTypes.array.isRequired,
};

export default Dropper;
