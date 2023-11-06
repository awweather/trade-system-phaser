const constants = {
  ui: {
    keys: {
      inventoryPanel: "inventoryPanel",
      inventoryGrid: "inventoryGrid",
    },
  },
  styles: {
    text: {
      fontSize: 12,
      fontFamily: "EightBitDragon",
      align: "center",
      wordWrap: { width: 200, useAdvancedWrap: true },
      colors: {
        Action: "#71b40c",
        Info: "#ffd541",
        Warning: "#ffa500",
        World: "#249fde",
        Area: "#b4202a",
        Tips: "#008080",
        teal: "#264f58",
        grey: "#929292",
        None: "#ffffff",
        blue: "#249fde",
        orange: "#f9a31b",
        hover: "#285cc4",
      },
    },
    colors: {
      headerText: "#dba463",
      viewedHeaderText: "#423934",
      primaryLight: 0x635c39,
      secondaryLight: 0x524e3b,
      tertiaryLight: 0x3d3925,
      //primaryDark: 0x201e13,
      primaryDark: 0x141013,
      secondaryDark: 0x363220,
      darkMaroon: 0x3b1725,
      primaryGrey: 0xb3b9d1,
      darkGrey: 0x393433,
      black: 0x000000,
      hoverLight: 0x948954,
      slateBlue: 0x2f4858,
      teal: 0x264f58,
      red: 0xc0070b,
      blue: 0x1520a6,
      orange: "#ca8219",
      green: "#59c135",
      separator: 0x71413b,
    },
  },
  directionThresholds: {
    up: {
      startAngle: 180,
      endAngle: 360,
    },
    down: {
      startAngle: 360,
      endAngle: 180,
    },
    left: {
      startAngle: 90,
      endAngle: 270,
    },
    right: {
      startAngle: 270,
      endAngle: 90,
    },
    up_right: {
      startAngle: 240,
      endAngle: 60,
    },
    up_left: {
      startAngle: 120,
      endAngle: 300,
    },
    down_left: {
      startAngle: 60,
      endAngle: 240,
    },
    down_right: {
      startAngle: 300,
      endAngle: 120,
    },
  },
};

export default constants;
