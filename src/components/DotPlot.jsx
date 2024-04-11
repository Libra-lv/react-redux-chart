/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getColorText } from "../helpers/getColorText";

const calculateTextWidth = (txt, fontSize) => {
  const newDiv = document.createElement("div");
  newDiv.append(txt);
  newDiv.style.cssText = `position:absolute;visibility:hidden;height:auto;width:auto;white-space:nowrap;font-size:${fontSize}`;
  document.body.append(newDiv);
  const labelWidth = newDiv.clientWidth;
  newDiv.remove();
  return labelWidth;
};

const convertData = (lowestBound, highestBound, width, variant) => {
  const lowerBound = variant?.confidentialInternal?.lowerBound ?? 0;
  const upperBound = variant?.confidentialInternal?.upperBound ?? 0;
  const midpoint = variant?.confidentialInternal?.changes ?? 0;

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
  const colorTextUpper = getColorText(upperBound);

  const options = {
    lowerBound,
    upperBound,
    midpoint,
    width,
  };

  let textLow = options?.lowerBound || 0;
  let textUpper = options?.upperBound || 0;

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

  const payload = {
    name: variant.name,
    low: lowerBound,
    mid: (lowerBound + upperBound) / 2,
    upper: upperBound,
    colorTrack,
    colorTextLow,
    colorTextUpper,
    textLow,
    textUpper,
  };

  const axisDelta = upperBound - lowerBound;
  if (axisDelta > 0) {
    const lineW = (axisDelta * width) / (highestBound - lowestBound);
    const defaultStrokeWidth = 30;
    if (lineW < defaultStrokeWidth) {
      const newDelta =
        (defaultStrokeWidth * (highestBound - lowestBound)) / width;
      payload.low = payload.low - newDelta / 2;
      payload.upper = payload.upper + newDelta / 2;
    }
  }

  return payload;
};

function DotPlot({ variants = [], tdRef }) {
  const dataviz = useRef();

  const [plotWidth, setPlotWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setPlotWidth(entries[0].contentRect.width);
    });
    observer.observe(tdRef.current);
    return () => tdRef.current && observer.unobserve(tdRef.current);
  }, []);

  variants = variants.filter(
    (v) => v.variantType && v.variantType == "COMPARED"
  );

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

  useEffect(() => {
    if (plotWidth == 0) return;
    // calculate label width
    const labels = variants.map((v) => v.name);
    const longestLabel = labels.sort((a, b) => b.length - a.length)[0];
    const fontSize = "12px";
    const labelWidth = calculateTextWidth(longestLabel, fontSize);

    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 30, left: labelWidth + 20 },
      width = plotWidth - margin.left - margin.right,
      height = labels.length * 35;

    const plotData = variants.map((v) =>
      convertData(lowestBound, highestBound, width, v)
    );

    const valueFontSize = "11px";
    const leftPadding = calculateTextWidth(String(lowestBound), valueFontSize);
    const domainStart =
      lowestBound - ((leftPadding + 10) * (highestBound - lowestBound)) / width;
    const rightPadding = calculateTextWidth(
      String(highestBound),
      valueFontSize
    );
    const domainEnd =
      highestBound +
      ((rightPadding + 10) * (highestBound - lowestBound)) / width;

    const hasData = plotData.filter((p) => p.upper - p.low > 0);
    if (hasData.length == 0) return;

    // append the svg object to the body of the page
    d3.select(dataviz.current).selectAll("svg").remove();
    const svg = d3
      .select(dataviz.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([domainStart, domainEnd])
      .range([0, width])
      .nice();
    svg
      .append("g")
      .call(d3.axisTop(x).tickSizeInner(-1 * height))
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("class", "axis_y_tick")
          .attr("stroke-width", 0.1)
      );

    // Y axis
    const y = d3
      .scaleBand()
      .domain(plotData.map((p) => p.name))
      .range([0, height])
      .padding(1);
    svg
      .append("g")
      .style("font-size", `${fontSize}`)
      .attr("dx", ".71em")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove());

    // Lines
    const stk_w = "4px";
    svg
      .selectAll("myline")
      .data(hasData)
      .join("line")
      .attr("x1", function (d) {
        return x(d.low);
      })
      .attr("x2", function (d) {
        return x(d.mid);
      })
      .attr("y1", function (d) {
        return y(d.name);
      })
      .attr("y2", function (d) {
        return y(d.name);
      })
      .attr("stroke", function (d) {
        return d.colorTrack;
      })
      .attr("stroke-width", stk_w);

    svg
      .selectAll("myline")
      .data(hasData)
      .join("line")
      .attr("x1", function (d) {
        return x(d.mid);
      })
      .attr("x2", function (d) {
        return x(d.upper);
      })
      .attr("y1", function (d) {
        return y(d.name);
      })
      .attr("y2", function (d) {
        return y(d.name);
      })
      .attr("stroke", function (d) {
        return d.colorTrack;
      })
      .attr("stroke-width", stk_w);

    const r = "5";
    // Circles of variable 1
    svg
      .selectAll("mycircle")
      .data(hasData)
      .join("circle")
      .attr("cx", function (d) {
        return x(d.low);
      })
      .attr("cy", function (d) {
        return y(d.name);
      })
      .attr("r", r)
      .style("fill", function (d) {
        return d.colorTrack;
      });

    // Circles of variable 2
    svg
      .selectAll("mycircle")
      .data(hasData)
      .join("circle")
      .attr("cx", function (d) {
        return x(d.mid);
      })
      .attr("cy", function (d) {
        return y(d.name);
      })
      .attr("r", r)
      .style("fill", function (d) {
        return d.colorTrack;
      });

    // Circles of variable 3
    svg
      .selectAll("mycircle")
      .data(hasData)
      .join("circle")
      .attr("cx", function (d) {
        return x(d.upper);
      })
      .attr("cy", function (d) {
        return y(d.name);
      })
      .attr("r", r)
      .style("fill", function (d) {
        return d.colorTrack;
      });

    svg
      .selectAll("textStart")
      .data(hasData)
      .enter()
      .append("text")
      .style("font-size", `${valueFontSize}`)
      .attr("fill", function (d) {
        return d.colorTextLow;
      })
      .attr("x", function (d) {
        const delta = calculateTextWidth(d.textLow + "%", valueFontSize);
        const axisDelta = ((delta + 20) * (domainEnd - domainStart)) / width;
        return x(d.low - axisDelta);
      })
      // .attr("x", function (d) { return x(d.low); })
      .attr("y", function (d) {
        return y(d.name);
      })
      .attr("dy", ".35em")
      .text(function (d) {
        return d.textLow + "%";
      });

    svg
      .selectAll("textEnd")
      .data(hasData)
      .enter()
      .append("text")
      .style("font-size", `${valueFontSize}`)
      .attr("fill", function (d) {
        return d.colorTextUpper;
      })
      .attr("x", function (d) {
        const axisDelta = (15 * (domainEnd - domainStart)) / width;
        return x(d.upper + axisDelta);
      })
      .attr("y", function (d) {
        return y(d.name);
      })
      .attr("dy", ".35em")
      .text(function (d) {
        return d.textUpper + "%";
      });
  }, [plotWidth]);

  return <div ref={dataviz} />;
}

export default DotPlot;
