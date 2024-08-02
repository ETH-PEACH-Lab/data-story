import React from "react";
import { CirclePicker } from "react-color";

const originalColors = [
  "#000000",
  "#AB14E2",
  "#FF0000",
  "#FF8700",
  "#FFD300",
  "#000001", // Representing white
  "#0AEFFF",
  "#580AFF",
  "#1C7B53",
  "#A1FF0A",
  "#FF69B4",
];

function tintColor(color, percentage) {
  const decimalPercentage = percentage / 100;
  const hex = color.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.round(r + (255 - r) * decimalPercentage);
  const newG = Math.round(g + (255 - g) * decimalPercentage);
  const newB = Math.round(b + (255 - b) * decimalPercentage);

  return `rgb(${newR}, ${newG}, ${newB})`;
}

const tintedColors = originalColors
  .filter((color) => color !== "#000001")
  .map((color) => tintColor(color, 60));

const allColors = [...originalColors, ...tintedColors];

const CustomColorPicker = ({ color, onChangeComplete }) => {
  const selectedColor = "#000001";

  const handleColorChangeComplete = (color) => {
    const newColor =
      color.hex.toLowerCase() === "#000001" ? "#FFFFFF" : color.hex;
    onChangeComplete({ hex: newColor });
  };

  return (
    <CirclePicker
      className="circle-picker"
      color={selectedColor}
      colors={allColors}
      onChangeComplete={handleColorChangeComplete}
    />
  );
};

export default CustomColorPicker;
