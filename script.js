const svg = d3.select("svg");
const margin = {top: 20, right: 100, bottom: 40, left: 150};
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let allData = [];
let currentData = [];

const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleBand().range([0, height]).padding(0.1);

const xAxisGroup = chart.append("g")
    .attr("transform", `translate(0, ${height})`);

const yAxisGroup = chart.append("g");

function rowConverter(d) {
    return {
        name: d.province,
        GDP: +d.GDP
    };
}

d3.csv("vn-provinces-data.csv", rowConverter)
.then(function(data) {
    allData = data;
    currentData = allData.slice(0, 20);
    updateChart();
});

function updateChart() {

    xScale.domain([0, d3.max(currentData, d => d.GDP)]);
    yScale.domain(currentData.map(d => d.name));

    const bars = chart.selectAll("rect")
        .data(currentData, d => d.name);

    // ENTER + UPDATE
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.name))
        .attr("height", yScale.bandwidth())
        .attr("width", 0)
        .merge(bars)
        .transition()
        .duration(1000)
        .on("start", function() {
            d3.select(this).attr("fill", "orange");
        })
        .on("end", function() {
            d3.select(this).attr("fill", "steelblue");
        })
        .attr("y", d => yScale(d.name))
        .attr("width", d => xScale(d.GDP));

    // EXIT
    bars.exit()
        .transition()
        .duration(500)
        .attr("width", 0)
        .remove();

    // LABELS
    const labels = chart.selectAll("text.label")
        .data(currentData, d => d.name);

    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("y", d => yScale(d.name) + yScale.bandwidth()/2)
        .attr("x", 0)
        .merge(labels)
        .transition()
        .duration(1000)
        .attr("y", d => yScale(d.name) + yScale.bandwidth()/2)
        .attr("x", d => xScale(d.GDP) + 5)
        .text(d => d.GDP);

    labels.exit().remove();

    // AXIS
    xAxisGroup.transition().duration(1000).call(d3.axisBottom(xScale));
    yAxisGroup.transition().duration(1000).call(d3.axisLeft(yScale));
}

// ADD

d3.select("#add-btn").on("click", function() {
    if (currentData.length < allData.length) {
        currentData.push(allData[currentData.length]);
        updateChart();
    }
});

// REMOVE

d3.select("#remove-btn").on("click", function() {
    currentData.pop();
    updateChart();
});

// SORT

d3.select("#sort-select").on("change", function(event) {
    const criterion = event.target.value;

    currentData.sort((a, b) => {
        if (criterion === "name") {
            return d3.ascending(a.name, b.name);
        } else {
            return b.GDP - a.GDP;
        }
    });

    updateChart();
});
