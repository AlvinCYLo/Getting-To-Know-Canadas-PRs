class Bars {
  /**https://observablehq.com/@d3/stacked-normalized-horizontal-bar
   * https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-stacked-bar-chart?file=/js/stackedBarChart.js
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _dataType, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 190,
      tooltipPadding: 15,
      margin: { top: 15, right: 15, bottom: 30, left: 25 },
    };
    this.data = _data;
    this.dataType = _dataType;
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
        `translate(0,${vis.config.margin.top})`
      );

    vis.chart = vis.chartArea.append("g");

    // Scales initialization

    vis.xScale = d3
      .scaleLinear()
      .range([vis.config.margin.left, vis.width - vis.config.margin.right]);

    vis.yScale = d3.scaleBand().range([vis.height, 0]).padding(0.08);

    // Axes initalization

    vis.xAxis = d3
      .axisBottom(vis.xScale)
      .ticks(10, "%")
      .tickSizeOuter(0)
      .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale).tickSizeOuter(0).tickPadding(10);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "bars x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart
      .append("g")
      .attr("class", "bars y-axis")
      .attr("transform", `translate(0,${-vis.config.margin.top})`);

    vis.color = d3.scaleOrdinal().range(d3.schemeSpectral[5]);
    
    // Create chart titles 
    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 5)
      .attr("dy", ".71em")
      .attr("font-size", "24")
      .style("text-anchor", "middle")
      .text(vis.chartName(vis.dataType));

    // Create various dictionaries for scalability of datasets and various bar charts
    vis.colLookupDict = {
      Occupation: "Code",
      Gender: "Gender",
      Age: "Age",
      Immigration: "Category",
      City: "City",
    };

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // read the relevant dataset source to use based on constructor type inputted

    let col2 = vis.data.map(function (d) {
      return d[vis.colLookupDict[vis.dataType]];
    });

    vis.uniqueCols = [...new Set(col2)];

    // Aggregate data based on the data source being used
    let lop = [];
    vis.data.forEach((element) => {
      let vals = Object.values(element).map((x) => parseInt(x));
      const prov = element.Province;
      const colEncoding = element[vis.colLookupDict[vis.dataType]];
      let sumCount = vals.filter((x) => parseInt(x)).reduce((a, b) => a + b, 0);

      const x = {
        province: prov,
        encodingColumn: colEncoding,
        count: sumCount,
      };

      lop.push(x);
    });
    let rollupList = d3.rollups(
      lop,
      (v) => d3.sum(v, (d) => d.count),
      (d) => d.encodingColumn
    );
    let finalListOfRows = [];
    let masterObject = {};
    rollupList.forEach((elem) => {
      masterObject[elem[0]] = elem[1];
    });
    masterObject.name = vis.dataType;
    finalListOfRows.push(masterObject);

    // Normalization of data for the 100% stacked bar chart
    let dataNormalized = [];
    let tot = 0;
    finalListOfRows.forEach(function (d) {
      // Compute the total
      let sumAll = Object.values(d);
      sumAll.splice(-1, 1);
      tot = d3.sum(sumAll);
    });
    finalListOfRows.forEach(function (d) {
      // Compute the total, divided, NA is discarded
      let newObj = {};
      let allKeys = Object.keys(d);
      allKeys.forEach((currKey) => {
        if (currKey != "name") newObj[currKey] = d[currKey] / tot;
      });
      newObj.name = d.name;
      dataNormalized.push(newObj);
    });
    vis.finalListOfRows = dataNormalized;

    // Set the scale to 100% and set appropriate domains
    vis.yScale.domain([vis.dataType]);
    vis.xScale.domain([0, 1]);
    vis.color.domain(vis.uniqueCols);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Stack bar chart initialization
    var serie = vis.chart
      .selectAll(".serie")
      .data(
        d3.stack().order(d3.stackOrderDescending).keys(vis.uniqueCols)(
          vis.finalListOfRows
        )
      )
      .join("g")
      .attr("class", "serie")
      .attr("fill", function (d) {
        return vis.color(d);
      })
      .on("mouseover", (event, d) => {
        // Tooltips with percentages
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                  <div>
                  <div class="tooltip-title">${d.key}</div>
                  <div>${((d[0][1] - d[0][0]) * 100).toFixed(2)}%</div></div>
                `);
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });

    // Rectangles positioning and width drawing
    serie
      .selectAll("rect")
      .data(function (d) {
        return d;
      })
      .join("rect")
      .attr("x", function (d) {
        return vis.xScale(d[0]);
      })
      .attr("y", function (d) {
        return vis.yScale(d.data.name);
      })
      .attr("height", vis.yScale.bandwidth())
      .attr("width", function (d) {
        return vis.xScale(d[1]) - vis.xScale(d[0]);
      });

    // Update axes and gridlines
    vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());
    vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());
  }

  // Helper function for chart name accuracy
  chartName(nam) {
    return nam == "Occupation" ? "Intended Occupation Type" : nam == "Immigration" ? "Immigration Category" : nam == "Age" ? "Age Group" : nam;
  }
}
