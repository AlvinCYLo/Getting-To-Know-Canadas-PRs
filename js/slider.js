class Slider {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1635,
      containerHeight: 100,
      tooltipPadding: 15,
      margin: { top: 0, right: 0, bottom: 10, left: 60 },
    };
    this.dispatcher = _dispatcher;
    this.initVis();
  }

  // Converts tick values into tick labels to show quarters (Q2) instead of decimals (.5)
  convert_tick(d) {
    let thing = " ";
    switch (d.toString().slice(d.toString().lastIndexOf(".") + 1)) {
      case "0":
        thing = thing + "Q1";
        break;
      case "25":
        thing = thing + "Q2";
        break;
      case "5":
        thing = thing + "Q3";
        break;
      case "75":
        thing = thing + "Q4";
        break;
    }
    return Math.floor(d).toString() + thing;
  }

  initVis() {
    let vis = this;

    // convert year and quarters to decimals for slider increments
    vis.data = [
      2015.0,
      2015.25,
      2015.5,
      2015.75,
      2016.0,
      2016.25,
      2016.5,
      2016.75,
      2017.0,
      2017.25,
      2017.5,
      2017.75,
      2018.0,
      2018.25,
      2018.5,
      2018.75,
      2019.0,
      2019.25,
      2019.5,
      2019.75,
      2020.0,
      2020.25,
      2020.5,
      2020.75,
    ];

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight+130);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.sliderArea = vis.svg
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .append("g")
      .attr("transform", "translate(55,30)");

    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", vis.config.containerWidth/2)
      .attr("y", 10)
      .style("text-anchor", "end")
      .text("Year and Quarter");

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    // Draw slider on svg 
    // adapted slider from range slider https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
    vis.slider = d3
      .sliderBottom()
      .min(d3.min(vis.data))
      .max(d3.max(vis.data))
      .width(vis.width-85)
      .tickFormat((d) => this.convert_tick(d))
      .ticks(6)
      .default([d3.min(vis.data), d3.max(vis.data)])
      .step(0.25)
      .fill("#2196f3")
      .on("onchange", (r) => {
        let range = vis.data.filter((d) => d >= r[0] && d <= r[1]);
        vis.dispatcher.call("updateRange", event, range);
      });

    vis.sliderArea.call(vis.slider);
  }
}
