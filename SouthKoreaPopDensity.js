/* ----------------------------------------------------------------------------
File: SouthKoreaPopDensity.js
Contructs a GeoMap based on population density in South Korea
80 characters perline, avoid tabs. Indet at 4 spaces. See google style guide on
JavaScript if needed.
-----------------------------------------------------------------------------*/ 

//Define Margin
var margin = {left: 80, right: 80, top: 0, bottom: 50 }, 
    width = 1200 - margin.left -margin.right,
    height = 800 - margin.top - margin.bottom;

//Define SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//Create a map to hold densities
var provinces = d3.map();

//Create a blue colorscale for shading
var color = d3.scaleThreshold()
    .domain(d3.range(0, 9))
    .range(d3.schemeBlues[9]);

//Scale the map and translate it back to view
var projection = d3.geoMercator()
  .scale(5800)
  .translate([ -width-11400, height+3520]);

//Set path to draw the map
var path = d3.geoPath()
    .projection(projection);

//Variables to move legend
var x = 700;
var y = 600;

//Add color legend
for(var i = 0; i < 8; i++){
    svg.append("rect")
        .attr("x",x + (30*i))
        .attr("y",y)
        .attr("width",30)
        .attr("height",10)
        .style("fill",color(i));
}

//Append legend
svg.append("text")
    .attr("x",x-20)
    .attr("y",y+40)
    .text("Population Density (in hundreds per sq km)"); 

//Create legend scale
var legendScale = d3.scaleLinear()
    .domain([0, 8])
    .rangeRound([0,240]);

//Format legend axis
var legendAxis = d3.axisBottom(legendScale)
    .tickSize(13)
    .ticks(8)
    .tickFormat(function (d){
        if(d == 8)
            return d + "+";
        else
            return d;
    })

//Draw the legend scale
svg.append("g")
    .call(legendAxis)
    .attr("transform", "translate(700,600)")
    .select(".domain")
    .remove();

//Define Tooltip here
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden")

//Get data through the use of Promises
var promises = [
  d3.json("PopDensity.json"),
  d3.csv("populationdensity.csv", function(d) {
      provinces.set(d.province, +d.density)
  }),
]

Promise.all(promises).then(ready)

function ready([kor]) {
  //Variable for superscript
  var two = "2";
    
  //Draw the map,shade by population density, and append their names on a hover-over
  svg.append("g")
      .selectAll("path")
      .data(topojson.feature(kor, kor.objects.gadm36_KOR_1).features)
      .enter().append("path")
      .attr("fill", function(d) {
          var col =  color(provinces.get(d.properties.NAME_1)/100);
          if (col) {
              return col
          } else {
              return '#ffffff'
          }
      })
      .attr("d", path)
      //[Requirement #2: Add Tooltip]
      .on("mouseover", function(d) {	
            tooltip.transition()		
            .duration(200)		
            .style("visibility", "visible")		
            tooltip.html(d.properties.NAME_1 + 
            "<br>Density: " + provinces.get(d.properties.NAME_1) + "/km" + two.sup()           
            )	
            .style("left", (d3.event.pageX + 28) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
            })
      .on("mousemove", function (d){
            tooltip.html(d.properties.NAME_1 + 
            "<br>Density: " + provinces.get(d.properties.NAME_1) + "/km" + two.sup()    
            )	
            .style("left", (d3.event.pageX + 28) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");		
      })
      .on("mouseout", function(d) {		
            tooltip.transition()		
            .duration(500)		
            .style("visibility", "hidden")	
      });
}
