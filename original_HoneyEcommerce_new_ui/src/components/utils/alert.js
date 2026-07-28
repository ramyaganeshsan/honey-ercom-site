import { createPortal } from "react-dom";
import classes from "../../assets/css/alert.module.css";

const alertElement = document.getElementById("alert");

const Alert = () => {
  const handleClose = () => {
    document.getElementById("alert_container").classList = "alert_hide";
  };

  return createPortal(
    <div className="alert_hide" id="alert_container">
      <p className={classes.alert_message} id="alert_message"></p>
      <span className={classes.closeButton} onClick={handleClose}>
        X
      </span>
    </div>,
    alertElement
  );
};

export default Alert;
