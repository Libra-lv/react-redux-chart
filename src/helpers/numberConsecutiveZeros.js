/* eslint-disable no-restricted-syntax */
// input = [0.0000064379583, 0.0356432, 0.00754373]
// output = [0.00000643, 0.0356, 0.00754]

export function countZero(number) {
  if (number === 0) return 0;
  const [, strAfterDot] = number.toString().split(".");
  const strToArray = strAfterDot?.split("") || [];
  let count0 = 0;
  for (const digit of strToArray) {
    if (digit === "0") {
      count0++;
    } else {
      break;
    }
  }
  return count0;
}

export function numberConsecutiveZeros(number) {
  if (number === 0) return 0;
  const [, strAfterDot] = number.toString().split(".");
  const strToArray = strAfterDot?.split("") || [];
  let count0 = 0;
  for (const digit of strToArray) {
    if (digit === "0") {
      count0++;
    } else {
      break;
    }
  }
  const consecutiveZeros = Array.from(Array(count0).keys())
    .map(() => 0)
    .join("");
  const newThreeNumber = strToArray.slice(count0, count0 + 3).join("");
  const res = `0.${consecutiveZeros}${newThreeNumber}`;
  return Number(
    Number(res).toFixed(consecutiveZeros.length + newThreeNumber.length)
  );
}

export function numberToFixed(number) {
  let mean = number;
  if (mean >= 0.1) {
    mean = Number(mean.toFixed(3));
  }
  if (mean < 0.1) {
    mean = Number(numberConsecutiveZeros(mean));
  }
  if (Number.isInteger(number)) {
    mean = Number(mean.toFixed(0));
  }

  return mean;
}
