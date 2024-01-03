import React, { Children } from "react";
import LinearGradient from "react-native-linear-gradient";
import Colors from "../constants/Colors";
import NMPHInset from "../constants/NMPHInset";

export function NeomorphicView({ children }: React.PropsWithChildren) {
  return (
    <LinearGradient
      colors={[Colors.twentyThree, Colors.twentyThree]}
      style={{ alignItems: "center", marginBottom: 12 }}
    >
      {children}
    </LinearGradient>
  );
}
