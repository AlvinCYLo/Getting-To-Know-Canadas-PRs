# CPSC 436V Project

## Canada Immigration Analysis (2015-2020)

- Welcome to our project on visualizing the immigration data and demographical breakdowns to Canada.

- bars.js -> Stacked bar charts code that sums to 100% of various breakdown categories
- main.js -> Initialization of various chart components and interactivity manager
- provinces.js -> Choropleth map of Canada for immigration percentages for certain timeframes
- slider.js -> Time slider detailing quarters and years to control other charts time component
- timeline.js -> Line chart visualizing counts of immigration over time for certain provinces or time duration
- worldmap.js -> World map chart with arcs visualizing immigration magnitudes from various countries around the world
- reused code from previous assignments such as bar chart, line chart,
- Adapted code from dispatcher https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-linked-charts-dispatcher and A2 instead of controlling filtering per chart inside other charts to avoid coupling.
- Adapted css from previous assignments on hover, and color change (A2)
- Reused global filter from A2 and https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-case-studies/tree/master/case-study_measles-and-vaccines to manipulate data in world map
- Decided to make it so that on province click, only 1 is able to be selected at a time to avoid confusion
- used rollup to get count of numbers for each bar chart to create proportions
- dispatcher used to consolidate code/filtering/interactivity into one place
- updated data for consistencies across spreadsheets

We have learned quite a lot about Canada through building this project and we are proud that we can call Canada our home as our visualization hopes to highlight the values of multiculturalism within the Canadian population.

- by Ansel Hartanto, Adrian Lewczuk, Alvin Lo

## References:

- Worldmap
  https://www.d3-graph-gallery.com/graph/connectionmap_basic.html

- Line chart
  https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-area-chart?file=/js/areachart.js

- Provinces
  https://socialinnovationsimulation.com/2013/07/11/tutorial-making-maps-on-d3/
  https://bl.ocks.org/AldermanAxe/fdd6459122babdfe1c4d

- Slider
  https://observablehq.com/@mbostock/hello-d3-simple-slider
  https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
