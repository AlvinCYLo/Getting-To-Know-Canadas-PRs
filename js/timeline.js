// adapted from tutorial line graph example https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-area-chart?file=/js/areachart.js
class Timeline {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1600,
      containerHeight: 450,
      tooltipPadding: 15,
      margin: { top: 35, right: 55, bottom: 10, left: 55 },
    };

    this.data = _data;
    this.quarters = this.data.columns.splice(2);
    this.initVis();
  }

  /**
   * Create scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Set scaling
    vis.xScale = d3.scalePoint().range([0, vis.width]);
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    // Set axes
    vis.xAxis = d3
      .axisBottom(vis.xScale)
      .ticks(vis.quarters.length)
      .tickSizeOuter(0)
      .tickSize(-vis.height)
      .tickPadding(10);

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickSize(-vis.width)
      .tickPadding(10);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Initialize clipping mask that covers the whole chart
    vis.chart
      .append("defs")
      .append("clipPath")
      .attr("id", "chart-mask")
      .append("rect")
      .attr("width", vis.width)
      .attr("y", -vis.config.margin.top)
      .attr("height", vis.config.containerHeight);

    // Apply clipping mask to 'vis.chart' to clip data from overlapping on axis
    vis.chart = vis.chart.append("g").attr("clip-path", "url(#chart-mask)");

    // Append axes titles and descriptors

    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", vis.config.margin.top)
      .attr("y", 10)
      .attr("dy", ".71em")
      .style("font-size", "20px")
      .text("Number of Inbound PRs");

    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 10)
      .attr("dy", ".71em")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Number of Incoming PRs by Year and Quarters From 2015 - 2020");

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    this.lop = [];
    // Value accessors
    vis.xValue = (d) => d.quarter;
    vis.yValue = (d) => d.count;

    vis.line = d3
      .line()
      .x((d) => vis.xScale(vis.xValue(d)))
      .y((d) => vis.yScale(vis.yValue(d)));

    vis.quarters.forEach((quarter) => {
      var totalSum = d3.sum(
        vis.data.map(function (d) {
          return d[quarter];
        })
      );
      const aggD = { quarter: quarter, count: totalSum };
      vis.lop.push(aggD);
    });

    // Set the scale input domains
    vis.xScale.domain(vis.quarters);
    vis.yScale.domain([0, d3.max(vis.lop.map((elem) => elem.count))]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Add line path
    vis.chart
      .selectAll(".chart-line")
      .data([vis.lop])
      .join("path")
      .attr("class", "chart-line")
      .attr("d", vis.line);

    // Update axes and gridlines
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }

  // gridlines in x axis function
  make_x_gridlines() {
    let vis = this;
    return d3.axisBottom(vis.xScale).ticks(vis.quarters.length);
  }

  // gridlines in y axis function
  make_y_gridlines() {
    let vis = this;
    return d3.axisLeft(vis.yScale).ticks(10);
  }
}
