const SpinnerWithMessage = ({ height = "", message }) => {
  let fallBackStyle = {
    width: "100%",
    height: "calc(100vh - 80px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  };

  if (height !== "") {
    fallBackStyle["height"] = height;
  }

  return (
    <div style={fallBackStyle}>
      {/* <div className="loader loader_with_message">Loading...</div> */}
      <div className="loader loader_with_message"></div>
      <p className="spinner_message">{message}</p>
    </div>
  );
};

export default SpinnerWithMessage;
