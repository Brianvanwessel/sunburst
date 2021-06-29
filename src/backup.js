import { createBreadCrumbs } from "/src/CreateBreadCrumbs.js";
import { colors } from "/src/colors_array.js";

/**
 * The function writeDownloadLink selects an svg and exports it.
 */
export const writeDownloadLink = (svgID, chartName) => {
  svgExport.downloadSvg(document.querySelector(`#${svgID}`), chartName);
};

/**
 * The function buildHierarchy is a helper function that transfroms a CSV file into hierarchical format.
 * @param {*} csv A string containing the CSV file.
 * @returns An object containing the hierarchical data.
 */
const buildHierarchy = (csv) => {
  const unqiueValues = [];
  const data = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("|");
    let currentNode = data;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          unqiueValues.push(childNode.name);
          children.push(childNode);
        }
        currentNode = childNode;
      }
      else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        let exists = false;
        children.forEach((element) => {
          if (element.name == childNode.name) {
            exists = true;
          }
        });
        if (!exists) {
          unqiueValues.push(childNode.name);
          children.push(childNode);
        } else {
          children.map((element) => {
            if (element.name == childNode.name) {
              const newValue = element.value + childNode.value;
              return { name: element.name, value: newValue };
            }
          });
        }
      }
    }
  }

  return { data, unqiueValues };
};

/**
 * The function pareCsvData converts the data from a CSV file to a hierarchical format needed for the graph.
 * @param {*} props an object containing the CSV data.
 * @returns data an object containing the hierarchical data.
 */
const parseCsvData = (props) => {
  const { csvData } = props;
  const csv = d3.csvParseRows(csvData);
  const { data, unqiueValues } = buildHierarchy(csv);
  return { data, unqiueValues };
};

/**
 * The function createPrimerArrays creates three array`s based on primers.
 * @param {*} data an object containing the hierarchical data.
 * @returns otherElements an arrary containing all other values.
 * @returns forwardElements an array containing all forward primers.
 * @returns reverseElements an array containing all reverse primers.
 */
const createPrimerArrays = (data) => {
  let otherElements = [];
  let forwardElements = [];
  let reverseElements = [];
  // data.children.forEach( (e)=>{
  //   if(e.name.includes('F')){
  //       if(!forwardElements.includes(e.name)){
  //         forwardElements.push(e.name)
  //     } else if(e.name.includes('R')) {
  //       if(!reverseElements.includes(e.name)){
  //         reverseElements.push(e.name)
  //       }
  //     } else{
  //       if(!otherElements.includes(e.name)){
  //         otherElements.push(e.name)
  //       }
  //     }
  // }
  //   e.children.forEach((e2)=>{
  //     if(e2.name.includes('F')){
  //       if(!forwardElements.includes(e2.name)){
  //         forwardElements.push(e2.name)
  //     }
  //   } else if(e2.name.includes('R')) {
  //       if(!reverseElements.includes(e2.name)){
  //         reverseElements.push(e2.name)
  //       }
  //     } else{
  //       if(!otherElements.includes(e2.name)){
  //         otherElements.push(e2.name)
  //       }
  //     }
  //   })
  // }

  // )
  data.forEach((e) => {
    if (e.includes("F")) {
      if (!forwardElements.includes(e)) {
        forwardElements.push(e);
      }
    } else if (e.includes("R")) {
      if (!reverseElements.includes(e)) {
        reverseElements.push(e);
      }
    } else {
      if (!otherElements.includes(e)) {
        otherElements.push(e);
      }
    }
  });

  return { otherElements, forwardElements, reverseElements };
};

/**
 *The function createColorScale creates an colorScale.
 * @param {*} domain an array containing all values that are used for the domain.
 * @param {*} range an array containing the range that are used for the range.
 * @returns an funcion that functions as an colorscale.
 */
const createColorScale = (domain, range) => {
  return d3.scaleOrdinal().domain(domain.sort()).range(range);
};

/**
 * The function partition create and d3 partition based on given data and radius.
 * @param {*} data an object containing the hierarchical data.
 * @param {*} radius a number containing the radius.
 * @returns an d3 partition based on given data.
 */
const partition = (data, radius) =>
  d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => {
        if (a.data.name == "no_match") {
          return -1;
        }
        if (b.data.name == "no_match") {
          return 1;
        }
        if (a.data.name < b.data.name) {
          return -1;
        }
        return a.data.name > b.data.name ? 1 : 0;
      })
  );

/**
 * The function createSunburst generates and renders an sunburst based on given data.
 * @param {*} sunburst_svg an svg that will be used to add the sunburst to.
 * @param {*} props an object containing all data needed to generate the sunburst.
 */
export const createSunburst = (sunburst_svg, props) => {
  const width = 800;

  const radius = width / 2;

  const { csvData, navbar_svg, breadcrumbWidth, breadcrumbHeight } = props;

  const { data, unqiueValues } = parseCsvData({ csvData });

  const { otherElements, forwardElements, reverseElements } =
    createPrimerArrays(unqiueValues);

  const color_scale = chroma.scale(colors);

  const primerColors = [];

  // const times = x => f => {
  //   if (x > 0) {
  //     f()
  //     times (x - 1) (f)
  //   }
  // }
  // times(forwardElements.length) (() => primerColors.push( "#" + Math.floor(Math.random()*16777215).toString(16)))

  //Create the color scales needed for the graph

  const forwardColor = createColorScale(
    forwardElements,
    color_scale.colors(forwardElements.length)
  );

  const reverseColor = createColorScale(
    reverseElements,
    color_scale.colors(reverseElements.length)
  );

  console.log(color_scale.colors(otherElements.length));
  const otherColor = createColorScale(otherElements, d3.schemeCategory10);

  // Function to create the arc used to create the graph
  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1);

  // Function to create the arc used for the hover function in the graph.
  const mousearc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius(radius);

  const root = partition(data, radius);

  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  let element = {};
  element.value = { sequence: [], percentage: 0.0 };

  //select all existing group elements for the navbar and bind the data to it.
  const text = sunburst_svg.selectAll("text").data([null]);

  //create enter selection and add group elements.
  const textEnter = text
    .enter()
    .append("text")
    .merge(text)
    .attr("text-anchor", "middle")
    .attr("fill", "#888")
    .style("visibility", "hidden")
    .attr("transform", (d, i) => `translate(${width / 2}, ${width / 2})`);

  //Exit selection that removes old elements.
  text.exit().remove();

  textEnter
    .append("tspan")
    .attr("id", "percentageTspan")
    .merge(text.select("#percentageTspan"))
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.1em")
    .attr("font-size", "3em")
    .text("");
  text.exit().selectAll("#percentageTspan").remove();

  textEnter
    .append("tspan")
    .attr("id", "test")
    .merge(text.select("#test"))
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "1.5em")
    .text("begins with this sequence");

  text.exit().selectAll("#test").remove();

  // Set attributes for svg.
  sunburst_svg
    .style("max-width", `${width}px`)
    .style("font", "12px sans-serif");
  // .attr("transform", (d, i) => `translate(${width/2}, 0)`)

  const sunburstg = sunburst_svg.selectAll("#container").data([null]);
  const sunburstgEnter = sunburstg.enter().append("g").attr("id", "container");
  sunburstgEnter.merge(sunburstg);
  //select all existing path elements for the navbar and bind the data to it.
  const sunburstselection = sunburst_svg
    .select("#container")
    .selectAll("path")
    .data(
      root.descendants().filter((d) => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    );

  //create enter selection and add path elements.
  const sunburstEnter = sunburstselection
    .enter()
    .append("path")
    .merge(sunburstselection)
    .attr("fill", (d) => {
      if (d.data.name.includes("F")) {
        return forwardColor(d.data.name);
      } else if (d.data.name.includes("R")) {
        return reverseColor(d.data.name);
      } else {
        return otherColor(d.data.name);
      }
    })
    .attr("fill-opacity", (d) => {
      if (d.data.name.slice(-1) == 2) {
        return 0.3;
      }
    })
    .attr("d", arc)
    .attr("transform", (d, i) => `translate(${width / 2}, ${width / 2})`);
  //Exit selection that removes old elements.
  sunburstselection.exit().remove();

  const hoverg = sunburst_svg.selectAll("#hover").data([null]);
  const hovergEnter = hoverg.enter().append("g").attr("id", "hover");
  hovergEnter
    .merge(hoverg)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      sunburstEnter.attr("fill-opacity", (d) => {
        if (d.data.name.slice(-1) == 2) {
          return 0.3;
        }
      });
      sunburstEnter.attr("stroke", "none");

      textEnter.style("visibility", "hidden");
      // Update the value of this view
      const sunburst = (element.value = { sequence: [], percentage: 0.0 });
      createBreadCrumbs(navbar_svg, {
        sunburst,
        breadcrumbWidth,
        breadcrumbHeight,
        forwardColor,
        reverseColor,
        otherColor,
      });
    });

  const navbar = sunburst_svg
    .select("#hover")
    .selectAll("path")
    .data(
      root.descendants().filter((d) => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    );

  //create enter selection and add group elements.
  const navbarEnter = navbar.enter().append("path");

  //Merge selection that transform the groups.
  navbarEnter
    .merge(navbar)
    .attr("d", mousearc)
    .attr("transform", (d, i) => `translate(${width / 2}, ${width / 2})`)
    .on("mouseenter", (event, d) => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d.ancestors().reverse().slice(1);
      // Highlight the ancestors
      sunburstEnter.attr("fill-opacity", (node) =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
      );

      sunburstEnter.attr("stroke", (d) => {
        if (sequence.includes(d)) {
          return "black";
        }
      });

      const percentage = ((100 * d.value) / root.value).toPrecision(3);

      // // Make a string for the selected sequence
      // let sequenceString = "";
      // sequence.forEach(element => {
      //   if(sequenceString =="")
      //   {
      //     sequenceString = sequenceString + element.data.name
      //   } else{
      //     sequenceString = sequenceString + ';' + element.data.name
      //   }

      // });
      textEnter
        .style("visibility", null)
        .select(".percentage")
        .style("font-size", "10px")
        .text(percentage + "%");
      // Update the value of this view with the currently hovered sequence and percentage
      const sunburst = (element.value = { sequence, percentage });

      createBreadCrumbs(navbar_svg, {
        sunburst,
        breadcrumbWidth,
        breadcrumbHeight,
        forwardColor,
        reverseColor,
        otherColor,
      });
    });

  navbar.exit().remove();
};
