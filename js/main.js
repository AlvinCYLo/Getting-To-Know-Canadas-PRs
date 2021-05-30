// Initialize global variables 
// create variables to hold both newly loaded csv files and filtered variables to use across multiple views
let data,
  worldmapgraph,
  provincesgraph,
  timelinegraph,
  bargraphoccupation,
  bargraphage,
  bargraphgender,
  bargraphimmigration,
  bargraphcity,
  sliderWidget,
  worldMapData,
  worldMapCentroidData,
  currentWorldMapData,
  timelineData,
  provincesImmigrationData,
  currentProvinceImmigrationData,
  provincesPopulationData,
  currentProvincePopulationData,
  barOccupationData,
  currentBarOccupationData,
  barGenderData,
  currentBarGenderData,
  barAgeData,
  currentBarAgeData,
  barImmigrationData,
  currentBarImmigrationData,
  barCityData,
  currentBarCityData;

const parseTime = d3.timeParse("%Y-%m-%d");
// dispatcher events to listen for
const dispatcher = d3.dispatch("updateRange", "selectProvince");
// Year and quarter dictionary
let decimalToQuarter = {
  2015.0: "2015 Q1",
  2015.25: "2015 Q2",
  2015.5: "2015 Q3",
  2015.75: "2015 Q4",
  2016.0: "2016 Q1",
  2016.25: "2016 Q2",
  2016.5: "2016 Q3",
  2016.75: "2016 Q4",
  2017.0: "2017 Q1",
  2017.25: "2017 Q2",
  2017.5: "2017 Q3",
  2017.75: "2017 Q4",
  2018.0: "2018 Q1",
  2018.25: "2018 Q2",
  2018.5: "2018 Q3",
  2018.75: "2018 Q4",
  2019.0: "2019 Q1",
  2019.25: "2019 Q2",
  2019.5: "2019 Q3",
  2019.75: "2019 Q4",
  2020.0: "2020 Q1",
  2020.25: "2020 Q2",
  2020.5: "2020 Q3",
  2020.75: "2020 Q4",
};
// Province dictionary
let provinceNameToCode = {
  "British Columbia": "BC",
  Alberta: "AB",
  Manitoba: "MB",
  "New Brunswick": "NB",
  "Nova Scotia": "NS",
  Saskatchewan: "SK",
  Ontario: "ON",
  Quebec: "QC",
  Yukon: "YK",
  "Northwest Territories": "NT",
  Nunavut: "NU",
  "Newfoundland and Labrador": "NL",
  "Prince Edward Island": "PE",
};

// Worldmap preprocessing and constructor, preprocess arc centroid data call from JSON
d3.csv("data/Country-of-Citizenship-Top-100-13.csv").then((citizData) => {
  worldMapData = citizData;
  currentWorldMapData = citizData;

  d3.json("data/centroids.json").then((centroidData) => {
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((mapData) => {
      worldMapCentroidData = centroidData;
      worldmapgraph = new Worldmap(
        {
          parentElement: "#worldmap",
        },
        citizData,
        centroidData,
        mapData
      );
    });
  });
});

// Timeline chart initialization with preprocessing of sum per quarter, (for Alvin: slider filtering should be injected here somehow)
d3.csv("data/Province-and-Gender-6.csv").then((occData) => {
  timelineData = occData;

  timelinegraph = new Timeline(
    {
      parentElement: "#timeline",
    },
    occData
  );
});

// Provinces chart initialization and aggregation headcount per province
d3.json("data/canada.topo.json.txt").then((mapCanada) => {
  d3.csv("data/Province-and-Occupation-5.csv").then((occData) => {
    d3.csv("data/Province-Populations.csv").then((popData) => {
      provincesImmigrationData = occData;
      currentProvinceImmigrationData = occData;

      provincesPopulationData = popData;
      currentProvincePopulationData = popData;

      provincesgraph = new Provinces(
        {
          parentElement: "#provinces",
        },
        mapCanada,
        occData,
        popData,
        dispatcher
      );
    });
  });
});

// Intialization of various stacked bar charts
// one variable for each bar chart
d3.csv("data/Province-and-Occupation-5.csv").then((d) => {
  barOccupationData = d;
  currentBarOccupationData = d;

  bargraphoccupation = new Bars(
    {
      parentElement: "#bars",
    },
    "Occupation",
    d
  );
});

d3.csv("data/Province-and-Age-7.csv").then((d) => {
  barAgeData = d;
  currentBarAgeData = d;

  bargraphage = new Bars(
    {
      parentElement: "#bars",
    },
    "Age",
    d
  );
});

d3.csv("data/Province-and-Gender-6.csv").then((d) => {
  barGenderData = d;
  currentBarGenderData = d;

  bargraphgender = new Bars(
    {
      parentElement: "#bars",
    },
    "Gender",
    d
  );
});

d3.csv("data/Province-and-Immigration-Category-1.csv").then((d) => {
  barImmigrationData = d;
  currentBarImmigrationData = d;

  bargraphimmigration = new Bars(
    {
      parentElement: "#bars",
    },
    "Immigration",
    d
  );
});

d3.csv("data/Province-and-City-3.csv").then((d) => {
  barCityData = d;
  currentBarCityData = d;

  bargraphcity = new Bars(
    {
      parentElement: "#bars",
    },
    "City",
    d
  );
});

// Slider widget constructor call
sliderWidget = new Slider(
  {
    parentElement: "#slider-step",
  },
  dispatcher
);

// Interactivity region filtering of worldmap
d3.selectAll("#region-selector").on("change", function () {
  let selectedFilter = d3.select(this).property("value");

  //reset provinces
  worldMapFilteredData =
    selectedFilter == "All"
      ? worldMapData
      : worldMapData.filter((d) => d.Region == selectedFilter);

  worldmapgraph.data = worldMapFilteredData;
  currentWorldMapData = worldMapFilteredData;

  worldmapgraph.updateVis();
});

dispatcher
  .on("updateRange", (range) => {
    range = range.map((r) => decimalToQuarter[r]);
    range.push("Region");
    range.push("Country");

    // Updating worldmap data
    let worldCountryInRange = getInRange(range, currentWorldMapData);

    worldmapgraph.data = worldCountryInRange;
    worldmapgraph.updateVis();
    range.pop();
    range.pop();

    // Updating provinces data
    range.push("Province");
    let provinceImmigrationInRange = getInRange(
      range,
      provincesImmigrationData
    );
    let provincePopulationInRange = getInRange(range, provincesPopulationData);

    provincesgraph.popData = provincePopulationInRange;
    provincesgraph.occData = provinceImmigrationInRange;
    provincesgraph.updateVis();

    // Updating stacked bar charts based on filtering 
    range.push("Code");
    let occupationInRange = getInRange(range, barOccupationData);
    bargraphoccupation.data = occupationInRange;
    currentBarOccupationData = occupationInRange;
    bargraphoccupation.updateVis();
    range.pop();

    range.push("Age");
    let ageInRange = getInRange(range, barAgeData);
    bargraphage.data = ageInRange;
    currentBarAgeData = ageInRange;
    bargraphage.updateVis();
    range.pop();

    range.push("Category");
    let immigrationInRange = getInRange(range, barImmigrationData);
    bargraphimmigration.data = immigrationInRange;
    bargraphimmigration.updateVis();
    range.pop();

    range.push("City");
    let cityInRange = getInRange(range, barCityData);
    bargraphcity.data = cityInRange;
    currentBarCityData = cityInRange;
    bargraphcity.updateVis();
    range.pop();

    range.push("Gender");
    let genderInRange = getInRange(range, barGenderData);
    bargraphgender.data = genderInRange;
    currentBarGenderData = genderInRange;
    bargraphgender.updateVis();
    range.pop();
  })
  .on("selectProvince", (province) => {
    // Timeline graph update based on province
    if (province == "CAN") {
      timelinegraph.data = timelineData;
      timelinegraph.updateVis();
    } else {
      province = provinceNameToCode[province];

      let timelineOfProvince = timelineData.filter(
        (d) => d.Province == province
      );
      timelinegraph.data = timelineOfProvince;
      timelinegraph.updateVis();
    }

    // barchart updates
    bargraphage.data =
      province == "CAN"
        ? currentBarAgeData
        : currentBarAgeData.filter((x) => x.Province == province);

    bargraphimmigration.data =
      province == "CAN"
        ? currentBarImmigrationData
        : currentBarImmigrationData.filter((x) => x.Province == province);

    bargraphcity.data =
      province == "CAN"
        ? currentBarCityData
        : currentBarCityData.filter((x) => x.Province == province);

    bargraphoccupation.data =
      province == "CAN"
        ? currentBarOccupationData
        : currentBarOccupationData.filter((x) => x.Province == province);

    bargraphgender.data =
      province == "CAN"
        ? currentBarGenderData
        : currentBarGenderData.filter((x) => x.Province == province);

    bargraphage.updateVis();
    bargraphimmigration.updateVis();
    bargraphcity.updateVis();
    bargraphoccupation.updateVis();
    bargraphgender.updateVis();
  });
// Helper function for list analysis
function getInRange(range, data) {
  let inRange = [];
  data.forEach((d) => {
    let item = {};
    range.forEach((r) => {
      item[r] = d[r];
    });
    inRange.push(item);
  });
  return inRange;
}
