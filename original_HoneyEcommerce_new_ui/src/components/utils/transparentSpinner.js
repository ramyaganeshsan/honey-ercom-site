const Spinner = ({ height = "" }) => {
  let fallBackStyle = {
    width: "100%",
    height: "calc(100vh - 80px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    zIndex: "9999",
    background: "rgba(0,0,0,0.1)",
  };

  if (height !== "") {
    fallBackStyle["height"] = height;
  }

  return (
    <div style={fallBackStyle}>
      {/* <div className="loader">Loading...</div> */}
      <div className="loader"></div>
    </div>
  );
};

export default Spinner;
