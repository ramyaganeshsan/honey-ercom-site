const Spinner = ({ height = "", image = false }) => {
  let fallBackStyle = {
    width: "100%",
    height: "calc(100vh - 80px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  let imageLoader = {
    width: "100%",
    height: "inherit",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "0",
    zIndex: "1",
    bottom: "0",
  };

  if (height !== "") {
    fallBackStyle["height"] = height;
    imageLoader["height"] = height;
  }

  return (
    <div style={image ? imageLoader : fallBackStyle}>
      {/* <div className="loader">Loading...</div> */}
      <div className="loader"></div>
    </div>
  );
};

export default Spinner;
