import React from "react";
import * as d3 from "d3";

function PlotChart() {
  const [data] = React.useState([
    [90, 20],
    [20, 100],
    [66, 44],
    [53, 80],
    [24, 182],
    [80, 72],
    [10, 76],
    [33, 150],
    [100, 15],
  ]);

  const svgRef = React.useRef();

  React.useEffect(() => {
    // setting up container
    const width = 400;
    const height = 400;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")
      .style("margin-top", "100px")
      .style("margin-left", "100px");

    // setting up scaling
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 200]).range([height, 0]);

    // setting up axis
    const xAxis = d3.axisBottom(xScale).ticks(data.length);
    const yAxis = d3.axisLeft(yScale).ticks(10);
    svg.append("g").call(xAxis).attr("transform", `translate(0, ${height})`);
    svg.append("g").call(yAxis);

    // setting up axis labeling
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .text("x axis");

    svg
      .append("text")
      .attr("x", -50)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text("y axis");

    // setting up data points
    svg
      .selectAll()
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]))
      .attr("r", 5)
      .attr("fill", "red")
      .attr("stroke", "black");
  }, []);

  return (
    <>
      <svg ref={svgRef} />
    </>
  );
}

export default PlotChart;
