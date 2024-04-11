/* eslint-disable react/prop-types */
import React from "react";

import LogarithmicChart from "./LogarithmicChart";

function ColumnConfidental({ variants = [] }) {
  const { lowestBound, highestBound } = variants.reduce(
    (acc, variant) => {
      const lowerBound = variant?.confidentialInternal?.lowerBound ?? 0;
      const upperBound = variant?.confidentialInternal?.upperBound ?? 0;
      if (lowerBound < acc.lowestBound) {
        acc.lowestBound = lowerBound;
      }
      if (upperBound > acc.highestBound) {
        acc.highestBound = upperBound;
      }
      return acc;
    },
    { lowestBound: 0, highestBound: 0 }
  );

  return (
    <>
      {variants.map((variant, variantIndex) => {
        const start = variant?.confidentialInternal?.lowerBound ?? 0;
        const end = variant?.confidentialInternal?.upperBound ?? 0;
        const total = end - start;

        return (
          <React.Fragment key={variantIndex}>
            {total > 0 ? (
              <LogarithmicChart
                lowestBound={lowestBound}
                highestBound={highestBound}
                variant={variant}
              />
            ) : (
              <div className="plot-chart">-</div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default ColumnConfidental;
