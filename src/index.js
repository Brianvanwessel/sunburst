import "../style.css";
import { writeDownloadLink, createSunburst } from "/src/createGraph.js";
import loadedData from "../Data.csv";


const generateSunburst = () =>{


// Select the svg for the sunburst
const sunburst_svg = d3.select("svg#sunburst");

const breadcrumbWidth = 170;

const breadcrumbHeight = 70;

// Select the svg for the infobar and add attributes and style
let navbar_svg = d3
  .select("svg#infobar")
  .attr("viewBox", `0 0 ${breadcrumbWidth * 20} ${breadcrumbHeight}`)
  .style("font", "12px sans-serif")
  .style("margin", "5px");

// Convert CSV data back to String
let csvData;
csvData = Papa.unparse(loadedData);

/**
 * The function render initializes the visualization
 */
const render = () => {
  d3.select("#download").on("click", () =>
    writeDownloadLink("sunburst", "sunburstChart")
  );
  createSunburst(sunburst_svg, {
    csvData,
    navbar_svg,
    breadcrumbWidth,
    breadcrumbHeight,
  });
};

// Initialize visualization
render();


}

generateSunburst()

