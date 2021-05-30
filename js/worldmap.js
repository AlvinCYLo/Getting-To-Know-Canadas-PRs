class Worldmap {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _centroid, _mapData) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1400,
      containerHeight: 700,
      tooltipPadding: 15,
      margin: { top: 15, right: 15, bottom: 20, left: 45 },
    };

    this.data = _data;
    this.centroids = _centroid;
    this.mapData = _mapData;
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

    vis.popScale = d3.scaleLinear().range([1, 10]);

    vis.chart = vis.chartArea.append("g");

    // Axes titles and descriptors
    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("World Map");

    vis.svg
      .append("text")
      .attr("class", "legend")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 20)
      .attr("dy", ".71em")
      .style("font-size", "16px")
      .style("text-anchor", "middle")
      .text("Width of bar = magnitude of incoming PRs");

    vis.projection = d3
      .geoMercator()
      .scale(130)
      .translate([vis.width / 2, (vis.height / 2) * 1.4]);

    // Draw the map
    vis.svg
      .append("g")
      .selectAll(".map")
      .data(vis.mapData.features)
      .enter()
      .append("path")
      .attr("fill", "#b8b8b8")
      .attr("d", d3.geoPath().projection(vis.projection))
      .style("stroke", "#fff")
      .style("stroke-width", 0);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Accessors intialization
    vis.xValue = (d) => d.a;
    vis.yValue = (d) => d.b;

    vis.citizDict = {};
    vis.countries = [];

    vis.data.forEach((elem) => {
      vis.countries.push(elem.Country);
      // splice non numeric values from values
      vis.citizDict[elem.Country] = d3.sum(Object.values(elem).splice(2));
    });

    vis.popScale.domain([0, d3.max(Object.values(vis.citizDict)) / 2]);

    const canada_coords = [-98.14238121819609, 61.469076186213755];

    let arcList = [];
    for (const [key, value] of Object.entries(vis.centroids)) {
      if (vis.countries.includes(key)) {
        let arc = {};
        arc.country1 = "Canada";
        arc.country2 = key;
        arc.linkData = {
          type: "LineString",
          coordinates: [canada_coords, value],
        };
        arc.inbound = vis.citizDict[key];
        arcList.push(arc);
      }
    }

    vis.arcs = arcList;
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // A path generator
    var path = d3.geoPath().projection(vis.projection);
    // Arcs drawing on svg
    vis.svg
      .selectAll(".geo-path")
      .data(vis.arcs)
      .join("path")
      .attr("class", "geo-path")
      .attr("d", (d) => path(d.linkData))
      .style("fill", "none")
      .style("stroke", "#ddd")
      .style("stroke-width", function (d) {
        return vis.lookupMagnitude(d);
      })
      // tooltips and color change on hover functionality
      .on("mouseover", function (event, d) {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                <div class="tooltip-title">${d.country2}</div>
                <div>Inbound PRs: ${d.inbound}</div>
              `);
        d3.select(this).style("stroke", "orange");
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", function (event, d) {
        d3.select("#tooltip").style("display", "none");
        d3.select(this).style("stroke", "#ddd");
      });

    vis.svg
      .selectAll(".geo-path")
      .data(vis.arcs)
      .join("path")
      .attr("class", "geo-path")
      .attr("d", (d) => path(d.linkData))
      .style("fill", "none")
      .style("stroke", "#ddd") // for M3, change color to saturation according to magnitude
      .style("stroke-width", function (d) {
        return vis.lookupMagnitude(d);
      })
      // tooltips and color change on hover functionality
      .on("mouseover", function (event, d) {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                <div class="tooltip-title">${d.country2}</div>
                <div>Inbound PRs: ${d.inbound}</div>
              `);
        d3.select(this).style("stroke", "orange");
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", function (event, d) {
        d3.select("#tooltip").style("display", "none");
        d3.select(this).style("stroke", "#ddd");
      });
  }

  // Looksup helper function for country population
  lookupMagnitude(dataObj) {
    let vis = this;
    let citizCount;
    if (dataObj.country1 != "Canada") {
      citizCount = vis.citizDict[dataObj.country1];
    } else {
      citizCount = vis.citizDict[dataObj.country2];
    }
    return vis.popScale(citizCount);
  }
}
