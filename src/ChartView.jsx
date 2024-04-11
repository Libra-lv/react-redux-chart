import clsx from "clsx";

// mocks
import { dataChart } from "./mocks/dataChart";

// components
import ColumnConfidental from "./components/ColumnConfidental";
import DotPlot from "./components/DotPlot";
import { useRef } from 'react'

// helpers
import { numberToFixed } from "./helpers/numberConsecutiveZeros";

function ChartView() {
  console.log("dataChart: ", dataChart);
  const tdRef = useRef();
  return (
    <div className="mt-8">
      <table className="experiment-results table-sm">
        <thead>
          <tr>
            <th align="left" className="axis-col header-label w-[200px]">
              Metrics
            </th>
            <th align="left" className="axis-col label w-[90px]">
              Mean
            </th>
            <th align="left" className="axis-col label w-[120px]">
              Changes
            </th>
            <th align="left" className="axis-col label w-[120px]">
              p_value
            </th>
            <th align="left" className="axis-col label">
              Confidental Interval
            </th>
          </tr>
        </thead>
        {dataChart.metrics.length > 0 ? (
          <>
            {dataChart.metrics.map((metric, metricIndex) => {
              const variantLength = metric.variants.length;

              return (
                <tbody key={metricIndex}>
                  <tr className="results-variation-head text-[#343a40] bg-[#f7f7f7]">
                    <td colSpan={5} className="py-2 font-bold text-[14px] px-3">
                      {metric.name}
                    </td>
                  </tr>
                  {metric.variants.map((variant, index) => {
                    let cssColorChange = "text-[#a0a0a0]";
                    const confidental = variant.confidentialInternal;
                    const lowerBound = confidental?.lowerBound ?? 0;
                    const upperBound = confidental?.upperBound ?? 0;
                    const total = lowerBound + upperBound;
                    // get mean number
                    const mean = numberToFixed(variant?.mean || 0);

                    // get changes number
                    const changes = numberToFixed(confidental?.changes || 0);
                    let changesText = "-";
                    if (changes !== 0) {
                      changesText = `${changes}%`;
                    }

                    // get p_value
                    const pValue = numberToFixed(variant?.PValue || 0);

                    // get css color
                    if (total > 0) {
                      cssColorChange = "text-[#239126]";
                    }
                    if (total < 0) {
                      cssColorChange = "text-[#f00]";
                    }
                    return (
                      <tr
                        key={index}
                        className="results-variation-row align-items-center py-4"
                      >
                        <td className="variation with-variation-label variation1 w-[215px] py-4 e">
                          <div className="text-ellipsis">{variant.name}</div>
                        </td>
                        <td className="value baseline py-4">{mean}</td>
                        <td
                          className={clsx(
                            "value baseline  py-4 font-bold text-[12px]",
                            cssColorChange
                          )}
                        >
                          {changesText}
                        </td>
                        <td className="value baseline  py-4">
                          {pValue || "-"}
                        </td>
                        {index === 0 && (
                          <td className="align-top" rowSpan={variantLength} ref={tdRef}>
                            {/* <ColumnConfidental variants={metric.variants} /> */}
                            <DotPlot variants={metric.variants} tdRef={tdRef} />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </>
        ) : (
          <tr>
            <td colSpan={5} className="py-2 font-bold text-[14px] px-3">
              sum_retention
            </td>
          </tr>
        )}
      </table>
    </div>
  );
}

export default ChartView;
