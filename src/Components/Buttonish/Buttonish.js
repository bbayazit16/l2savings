import "./Buttonish.css";
import PropTypes from "prop-types";

const Buttonish = ({
  text,
  onClick,
  noWrap,
  img,
  alt,
  showCircularBG,
  extraProperty,
  imgSize,
  isAnchor,
  href,
  newTab,
  download,
  imgExtraClass,
}) => {
  return !isAnchor ? (
    <div className={"buttonish " + (extraProperty || "")} onClick={onClick}>
      <p className={(img ? null : "no-img ") + (noWrap ? "nowrap" : null)}>
        {text}
      </p>
      {img ? (
        <div
          className={
            "buttonishphotocontainer " + (showCircularBG ? "" : "invisible ")
          }
        >
          <img
            src={img}
            alt={alt}
            className={"buttonishphoto " + (imgExtraClass || "")}
            style={
              imgSize ? { height: imgSize.height, width: imgSize.width } : null
            }
          ></img>
        </div>
      ) : null}
    </div>
  ) : (
    <a
      className="buttonish nodecoration"
      onClick={onClick}
      href={href || "#"}
      download={download}
      target={newTab ? "_blank" : "_self"}
      rel="noreferrer"
    >
      <p className={(img ? null : "no-img ") + (noWrap ? "nowrap" : null)}>
        {text}
      </p>
      {img ? (
        <div
          className={
            "buttonishphotocontainer " + (showCircularBG ? "" : "invisible")
          }
        >
          <img
            src={img}
            alt={alt}
            className={"buttonishphoto " + (imgExtraClass || "")}
            style={
              imgSize ? { height: imgSize.height, width: imgSize.width } : null
            }
          ></img>
        </div>
      ) : null}
    </a>
  );
};

Buttonish.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  noWrap: PropTypes.bool,
  img: PropTypes.any,
  alt: PropTypes.string,
  showCircularBG: PropTypes.bool,
  extraProperty: PropTypes.string,
  imgSize: PropTypes.object,
  isAnchor: PropTypes.bool,
  href: PropTypes.string,
  newTab: PropTypes.bool,
  download: PropTypes.string,
  imgExtraClass: PropTypes.string,
};

export default Buttonish;
