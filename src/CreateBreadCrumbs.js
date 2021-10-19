/**
 * The function breadCrumbPoints generates the positions and structure of a polygon used for the navbar.
 * @param {*} i The index of the selected position in the sunburst. Based on in which layer the selected position resides.  
 * @param {*} breadcrumbWidth a number containing the width used to generate the polygon.
 * @param {*} breadcrumbHeight a number containing the width used to generate the polygon.
 * @returns a string that describes the points of a breadcrumb SVG polygon.
 */
function breadCrumbPoints(props) {
  const {i,breadcrumbWidth,breadcrumbHeight} = props
  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`${breadcrumbWidth},0`);
  points.push(`${breadcrumbWidth + + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
      return points.join(" ");
  } 


/**
 * The function createBreadCrumbs generates the interative navbar based on given data.
 * @param {*} navbar_svg an svg that will be used to add the navbar to.
 * @param {*} props an object containing all the data needed to generate the navbar.
 */
export const createBreadCrumbs = (navbar_svg,props)=>{ 

  const {sunburst,breadcrumbWidth,breadcrumbHeight,forwardColor,reverseColor,otherColor} = props
  
  // select all existing group elements for the navbar and bind the data to it
  const g = navbar_svg.selectAll("g").data(sunburst.sequence)

  // Create enter selection and add group elements
  const gEnter = g.enter().append('g')

  // Merge selection that transform the groups
  gEnter.merge(g)
    .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);
  
  // Exit selection that removes old elements
  g.exit().remove();

  // Create merge selection for the polygons and add needed attributes
  gEnter.append("polygon")
    .merge(g.select("polygon"))
        .attr("points", (d,i)=> breadCrumbPoints({i,breadcrumbWidth,breadcrumbHeight}))
        .attr("fill", d => {

            if(d.data.name.includes('F')){
                return forwardColor(d.data.name)
            } else if(d.data.name.includes('R')){
                return reverseColor(d.data.name)
            } else{
                return otherColor(d.data.name)
            }
        })
        .attr('opacity',(d)=>{
          if(d.data.name.slice(-1) == 2){
            return 0.3
          }
        })
        .attr("stroke", "white");
    // Exit selection that removes old polygon elements
    g.exit().selectAll('polygon').remove();


  // Create the text elements that show up inside the polygons to describe the values
  gEnter.append("text")
    .merge(g.select('text'))
    .attr("x", (breadcrumbWidth + 10) / 2)
    .attr("y", 15)
    .attr("dy", "0.99em")
    .attr("text-anchor", "middle")
    .attr("font-size", "4em")
    .attr("fill", "black")
    .attr("stroke","white")
    .attr("stroke-width","0.1")
    .text(d => { 
        return d.data.name});
 
    // Exit selection that removes old text elements    
    g.exit().select('text').remove()
    
    // Select all elements with the id 'percentage' and bind the data to it
    const text = navbar_svg.selectAll("#percentage").data([sunburst],data=>{ 
      
      return [data.percentage,data.sequence.length]})
  
    // Enter selection and set the attributes and text
    const textEnter = text.enter().append('text')
    .attr("id", "percentage")
    .text(sunburst.percentage > 0 ? sunburst.percentage + "%" : "")
    .attr("x", (sunburst.sequence.length + 0.5) * breadcrumbWidth)
    .attr("y", breadcrumbHeight / 2)
    .attr("dy", "0.35em")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle");

    // Merge selection
    textEnter.merge(text)
    
    // Exit selection and remove old elements
    text.exit().remove(); 
}