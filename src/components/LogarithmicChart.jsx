/* eslint-disable react/prop-types */
import React from "react";

// helpers
import { getColorText } from "../helpers/getColorText";

function LogarithmicChart({ lowestBound, highestBound, variant }) {
  const divRef = React.useRef(null);
  // states
  const [options, setOptions] = React.useState(null);

  React.useLayoutEffect(() => {
    if (!variant || !divRef) return;
    const lowerBound = variant?.confidentialInternal?.lowerBound ?? 0;
    const upperBound = variant?.confidentialInternal?.upperBound ?? 0;
    const midpoint = variant?.confidentialInternal?.changes ?? 0;
    const rangeXAxis = (highestBound - lowestBound) / 10;

    // get position
    let low = lowerBound;
    let upper = upperBound;
    let mid = 0;

    if (low === lowestBound) {
      low = 0;
    } else {
      if (lowestBound < 0) {
        low = ((lowerBound - lowestBound) / rangeXAxis) * 10;
      } else {
        low = ((lowerBound + lowestBound) / rangeXAxis) * 10;
      }
      mid = low;
    }

    if (upper === highestBound) {
      upper = 100;
    } else {
      if (lowestBound < 0) {
        upper = ((upperBound - lowestBound) / rangeXAxis) * 10;
      } else {
        upper = ((upperBound + lowestBound) / rangeXAxis) * 10;
      }
    }

    let trackWidth = Number(upper) - Number(low);
    if (upper - low < 3) {
      upper = upper + 3;
      trackWidth = Number(upper) - Number(low);
    }

    // get color line track
    let colorTrack = "#a0a0a0";
    if (lowerBound < 0 && upperBound < 0) {
      colorTrack = "#f00";
    }
    if (lowerBound > 0 && upperBound > 0) {
      colorTrack = "#239126";
    }

    // get color of dot
    const colorTextLow = getColorText(lowerBound);
    const colorTextMid = getColorText(midpoint);
    const colorTextUpper = getColorText(upperBound);

    const payload = {
      low,
      upper,
      mid,
      lowerBound,
      upperBound,
      midpoint,
      colorTrack,
      colorTextLow,
      colorTextMid,
      colorTextUpper,
      width: divRef.current?.offsetWidth,
      trackWidth,
      rangeXAxis,
    };

    setOptions(payload);
  }, [lowestBound, highestBound, variant]);

  const low = options?.low || 0;
  const mid = options?.mid || 0;
  let trackWidth = options?.trackWidth || 0;
  let upper = options?.upper || 0;
  let textLow = options?.lowerBound || 0;
  let textUpper = options?.upperBound || 0;

  if (options?.width < 300 && upper - low < 10) {
    upper = options?.upper + 10;
    trackWidth = options?.trackWidth + 10;
  }

  if (textLow > -1 && textLow < 1) {
    textLow = Number(textLow.toFixed(3));
  } else if ((textLow > -10 && textLow < -1) || (textLow > 1 && textLow < 10)) {
    textLow = Number(textLow.toFixed(1));
  }

  if (textUpper > -1 && textUpper < 1) {
    textUpper = Number(textUpper.toFixed(3));
  } else if (
    (textUpper > -10 && textUpper < -1) ||
    (textUpper > 1 && textUpper < 10)
  ) {
    textUpper = Number(textUpper.toFixed(1));
  }

  return (
    <>
      <div ref={divRef} className="plot-chart">
        {options && (
          <>
            <div
              className="slider_track"
              style={{
                backgroundColor: options.colorTrack,
                width: `${trackWidth}%`,
                left: `${mid}%`,
              }}
            />

            <div
              id="low"
              className="slider_handle slider_handle-left"
              style={{
                backgroundColor: options.colorTrack,
                left: `${low}%`,
                color: options.colorTextLow,
              }}
            >
              <span>{textLow + "%"}</span>
            </div>

            <div
              id="midpoint"
              className="slider_handle slider_handle-middle"
              style={{
                backgroundColor: options.colorTrack,
                left: `${(low + upper) / 2}%`,
                color: options.colorTextMid,
              }}
            >
              {/* <span>{textMid + "%"}</span> */}
            </div>

            <div
              id="upper"
              className="slider_handle slider_handle-right"
              style={{
                backgroundColor: options.colorTrack,
                left: `${upper}%`,
                color: options.colorTextUpper,
              }}
            >
              <span>{textUpper + "%"}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default LogarithmicChart;
