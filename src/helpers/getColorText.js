export function getColorText(number) {
  if (number < 0) {
    return "#f00";
  } else if (number > 0) {
    return "#239126";
  } else {
    return "#a0a0a0";
  }
}
