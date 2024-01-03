import img from "./assets/heroImg1.jpg";
import logo from "./assets/icon.png";

function App() {
  return (
    <div
      style={{
        background: "black",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          height: "90vh",
          width: "60vw",
          marginLeft: "30%",
          overflowX: "clip",
          background: `url(${img})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        {/*overlay*/}
        <div
          style={{
            width: "100%",
            background: "rgba(29, 29, 29, 0.25)",
          }}
        ></div>
      </div>
      <div
        style={{
          textAlign: "left",
          position: "absolute",
          left: 100,
          top: 200,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1 style={{ color: "white", fontSize: "4rem" }}>Keep your workout</h1>
        <h1 style={{ color: "#98F2E7", fontSize: "8rem" }}>Revolutionary</h1>
        <p style={{ color: "whitesmoke", fontSize: "1.8rem", margin: 8 }}>
          Your fitness goals, your way -- Tailor your fitness routine with ease,
          selecting from a vast array of 1300+ exercises
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <img src={logo} style={{ height: "20%", width: "20%" }} alt="Logo" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 80,
            }}
          >
            <button
              title="Download"
              style={{
                padding: 18,
                paddingInline: 40,
                borderRadius: 40,
                border: "none",
                color: "#191919",
                fontSize: "1.3rem",
                backgroundColor: "whitesmoke",
              }}
            >
              Download
            </button>
            <p style={{ color: "white", margin: 15, fontSize: "1.3rem" }}>
              Available on iOS and Android
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "black",
          color: "white",
          display: "flex",
          justifyContent: "space-around",
          padding: "20px",
        }}
      >
        <p>Terms & Conditions</p>
        <p>Privacy Policy</p>
        <a>Contact Us</a>
      </div>
    </div>
  );
}

export default App;

{
  /* <div
style={{
  marginLeft: "40%",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
}}
>
<h1 style={{ color: "white", textAlign: "center", fontSize: 65 }}>
  Keep your workout revolutionary
</h1>
<img
  src={logo}
  style={{ height: 200, width: 200, alignSelf: "center" }}
/>
</div> */
}
