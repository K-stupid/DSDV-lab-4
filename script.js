const svg = d3.select("svg");

const margin = { top: 50, right: 100, bottom: 40, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// TITLE
svg.append("text")
    .attr("x", 200)
    .attr("y", 25)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Horizontal Bar Chart of GRDP in VND by Province");

let allData = [];
let currentData = [];

// SCALE
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleBand().range([0, height]).padding(0.1);

// AXIS
const xAxisGroup = chart.append("g")
    .attr("transform", `translate(0, ${height})`);

const yAxisGroup = chart.append("g");

// GRID
const gridGroup = chart.append("g")
    .attr("class", "grid");

// DATA FORMAT
function rowConverter(d) {
    return {
        name: d.province,
        GDP: +d.grdp   
    };
}

// LOAD DATA
d3.csv("vn-provinces-data.csv", rowConverter)
.then(data => {
    allData = data;

    currentData = allData.slice(0, 15);

    currentData.sort((a, b) => b.GDP - a.GDP);

    updateChart();
})
.catch(error => console.log(error));

// UPDATE FUNCTION
function updateChart() {

    xScale.domain([0, d3.max(currentData, d => d.GDP)]);
    yScale.domain(currentData.map(d => d.name));

    // GRID
    gridGroup
        .transition()
        .duration(1000)
        .call(d3.axisBottom(xScale)
            .tickSize(height)
            .tickFormat("")
        );

    // AXIS
    xAxisGroup.transition().duration(1000).call(d3.axisBottom(xScale));
    yAxisGroup.transition().duration(1000).call(d3.axisLeft(yScale));

    //  BARS 
    const bars = chart.selectAll("rect")
        .data(currentData, d => d.name);

    // EXIT
    bars.exit()
        .transition()
        .duration(500)
        .attr("width", 0)
        .remove();

    // UPDATE
    bars.transition()
        .duration(1000)
        .attr("y", d => yScale(d.name))
        .attr("width", d => xScale(d.GDP))
        .attr("fill", (d, i) => d3.interpolateYlOrRd(i / currentData.length));

    // ENTER
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.name))
        .attr("height", yScale.bandwidth())
        .attr("width", 0)
        .attr("fill", "orange")
        .transition()
        .duration(1000)
        .attr("width", d => xScale(d.GDP))
        .attr("fill", (d, i) => d3.interpolateYlOrRd(i / currentData.length));

    //  LABELS 
    const labels = chart.selectAll("text.label")
        .data(currentData, d => d.name);

    labels.exit().remove();

    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr("x", 0)
        .merge(labels)
        .transition()
        .duration(1000)
        .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr("x", d => xScale(d.GDP) + 5)
        .attr("dy", "0.35em")
        .text(d => d.GDP.toFixed(2));
}

//  ADD 
d3.select("#add-btn").on("click", function () {
    if (currentData.length < allData.length) {
        currentData.push(allData[currentData.length]);
        currentData.sort((a, b) => b.GDP - a.GDP);
        updateChart();
    }
});

//  REMOVE 
d3.select("#remove-btn").on("click", function () {
    currentData.pop();
    updateChart();
});

//  SORT 
d3.select("#sort-select").on("change", function (event) {
    const criterion = event.target.value;

    if (criterion === "name") {
        currentData.sort((a, b) => d3.ascending(a.name, b.name));
    } else {
        currentData.sort((a, b) => b.GDP - a.GDP);
    }

    updateChart();
});
