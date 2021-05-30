class Provinces {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _can, _occData, _popData, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 530,
      tooltipPadding: 15,
      margin: { top: 15, right: 15, bottom: 20, left: 45 },
    };

    this.can = _can;
    this.popData = _popData;
    this.occData = _occData;
    this.dispatcher = _dispatcher;
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

    vis.chart = vis.chartArea.append("g");
    // Chart title
    vis.svg
      .append("text")
      .attr("x", 55)
      .attr("y", 30)
      .attr("font-size", 25)
      .attr("dy", ".71em")
      .text("[click me to reset]")
      .on("click", (event) => {
        vis.dispatcher.call("selectProvince", event, "CAN");
      });

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.range = [];

    // initialize count for each provicne
    vis.immDict = {
      AB: 0,
      BC: 0,
      NB: 0,
      NT: 0,
      ON: 0,
      QC: 0,
      PE: 0,
      YK: 0,
      SK: 0,
      MB: 0,
      NS: 0,
      NL: 0,
      NU: 0,
    };

    // color scale initialization
    vis.cscale = d3.scaleLinear().domain([0, 0.8]).range(d3.schemeBlues[5]);

    // map projectiong intialization
    vis.projection = d3
      .geoOrthographic()
      .clipAngle(90)
      .rotate([98, -60])
      .scale(700)
      .translate([500, 200])
      .scale(800)
      .translate([vis.width / 2, (3 * vis.height) / 5]);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.occData.forEach((elem) => {
      let prov = elem.Province;
      const popCount = d3.sum(Object.values(elem).splice(2));
      if (prov != "NA") {
        vis.immDict[prov] = vis.immDict[prov] + popCount;
      }
    });

    // Initialize population dictionary
    let populationDict = {};
    vis.popData.forEach((elem) => {
      populationDict[elem.Province] = d3.mean(Object.values(elem));
    });

    vis.populationDict = populationDict;

    const provincesArr = [
      "British Columbia",
      "Alberta",
      "Manitoba",
      "New Brunswick",
      "Nova Scotia",
      "Saskatchewan",
      "Ontario",
      "Quebec",
      "Yukon",
      "Northwest Territories",
      "Nunavut",
      "Newfoundland and Labrador",
      "Prince Edward Island",
    ];
    let percentArr = provincesArr.map((prov) => vis.proportionConverter(prov));
    vis.maxData = d3.max(percentArr);

    // Color scale initialization with same sized bins
    vis.cscale = d3
      .scaleThreshold()
      .domain([
        vis.maxData * (1 / 6),
        vis.maxData * (2 / 6),
        vis.maxData * (3 / 6),
        vis.maxData * (4 / 6),
        vis.maxData * (5 / 6),
      ])
      .range(d3.schemeBlues[6]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    // Draw main province chart
    vis.svg
      .append("g")
      .selectAll(".province")
      .data(topojson.feature(vis.can, vis.can.objects["provinces"]).features)
      .join("path")
      .attr("d", vis.path)
      .attr("class", "province")
      .attr("active", "true")
      .style("fill", function (d) {
        return vis.cscale(vis.proportionConverter(d));
      })
      // pass province id to dispatcher 
      .on("click", (event, d) => {
        vis.dispatcher.call("selectProvince", event, d.id);
      })
      // tooltip interactivity
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                  <div class="tooltip-title">${d.id}</div>
                  <div>${vis.proportionConverter(d)}%</div></div>
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

    vis.svg
      .append("path")
      .data(
        topojson.mesh(vis.can, vis.can.objects["provinces"], function (a, b) {
          return a !== b;
        })
      )
      .attr("class", "mesh")
      .attr("d", vis.path);
    
    // Legend initialization for color scale
    var colorLegend = d3
      .legendColor()
      .labelFormat(d3.format(".2f"))
      .labels(d3.legendHelpers.thresholdLabels)
      .scale(vis.cscale)
      .shapePadding(5)
      .shapeWidth(50)
      .shapeHeight(20)
      .labelOffset(12);
      
    vis.svg.selectAll(".legend").remove();
    vis.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(810,20)")
      .call(colorLegend);
    
    // Legend title
    vis.svg.selectAll(".legend-title").remove();
    vis.svg
      .append("text")
      .attr("class", "legend-title")
      .attr("x", 700)
      .attr("y", 5)
      .attr("dy", ".71em")
      .attr("font-weight", 200)
      .text("Immigration proportion to province population (%)");
  }

  // Calculates proportion of immigrants against total population of a province
  proportionConverter(provObj) {
    let vis = this;
    var prov;
    if (provObj.id != null) {
      prov = provObj.id;
    } else {
      prov = provObj;
    }
    if (prov == "British Columbia") {
      return ((vis.immDict["BC"] / vis.populationDict["BC"]) * 100).toFixed(3);
    }
    if (prov == "Alberta") {
      return ((vis.immDict["AB"] / vis.populationDict["AB"]) * 100).toFixed(3);
    }
    if (prov == "Saskatchewan") {
      return ((vis.immDict["SK"] / vis.populationDict["SK"]) * 100).toFixed(3);
    }
    if (prov == "Yukon") {
      return ((vis.immDict["YK"] / vis.populationDict["YK"]) * 100).toFixed(3);
    }
    if (prov == "Manitoba") {
      return ((vis.immDict["MB"] / vis.populationDict["MN"]) * 100).toFixed(3); // diff
    }
    if (prov == "Ontario") {
      return ((vis.immDict["ON"] / vis.populationDict["ON"]) * 100).toFixed(3);
    }
    if (prov == "Quebec") {
      return ((vis.immDict["QC"] / vis.populationDict["QC"]) * 100).toFixed(3);
    }
    if (prov == "Nova Scotia") {
      return ((vis.immDict["NS"] / vis.populationDict["NS"]) * 100).toFixed(3);
    }
    if (prov == "Newfoundland and Labrador") {
      return ((vis.immDict["NL"] / vis.populationDict["NL"]) * 100).toFixed(3);
    }
    if (prov == "Northwest Territories") {
      return ((vis.immDict["NT"] / vis.populationDict["NT"]) * 100).toFixed(3);
    }
    if (prov == "Nunavut") {
      return ((vis.immDict["NU"] / vis.populationDict["NU"]) * 100).toFixed(3);
    }
    if (prov == "New Brunswick") {
      return ((vis.immDict["NB"] / vis.populationDict["NB"]) * 100).toFixed(3);
    }
    if (prov == "Prince Edward Island") {
      return ((vis.immDict["PE"] / vis.populationDict["PE"]) * 100).toFixed(3);
    }
  }
}
