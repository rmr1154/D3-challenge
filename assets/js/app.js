var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .classed("chart", true)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(stateData, d => d[chosenXAxis]))
        .range([0, width])
        .nice()
        .clamp(false);

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
    .domain(d3.extent(stateData, d => d[chosenYAxis]))
        .range([height, 0])
        .nice()
        .clamp(false);

    return yLinearScale;
}

// // function used for updating x-scale var upon click on axis label
// function xScale(stateData, chosenXAxis) {
//     // create scales
//     var xLinearScale = d3.scaleLinear()
//         .domain([d3.min(stateData, d => d[chosenXAxis]),//* 0.8,
//         d3.max(stateData, d => d[chosenXAxis]) //* 1.1
//         ])
//         .range([0, width])
//         .nice()
//         .clamp(true);

//     return xLinearScale;
// }

// // function used for updating y-scale var upon click on axis label
// function yScale(stateData, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//         .domain([d3.min(stateData, d => d[chosenYAxis]),//* .8,
//         d3.max(stateData, d => d[chosenYAxis]) //* 1.2
//         ])
//         .range([height, 0])
//         .nice()
//         .clamp(true);

//     return yLinearScale;
// }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderyYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroupItems, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroupItems.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

        circlesGroupItems.selectAll("text")
        .transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return circlesGroupItems;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroupItems) {

    switch (chosenXAxis) {
        case "poverty":
            var xLabel = "Poverty Rate (%):"
            break
        case "age":
            var xLabel = "Age (Median):"
            break
        case "income":
            var xLabel = "Household Income (Median):"
            break
    }

    switch (chosenYAxis) {
        case "healthcare":
            var yLabel = "Lacking Healthcare:"
            break
        case "obesity":
            var yLabel = "Obesity:"
            break
        case "smokes":
            var yLabel = "Smokes:"
            break
    }


    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]} %`);
        });

    circlesGroupItems.call(toolTip);

    circlesGroupItems.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroupItems;
}



// id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,healthcareHigh,obesity
// ,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,-0.385218228

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (stateData, err) {
    if (err) throw err;

    // parse data
    stateData.forEach(function (data) {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
        //console.log(data.id);
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // build initial circle group and bind to data
    var circlesGroup = chartGroup.selectAll("g circle")
        .data(stateData);


    // append our circles
    var circlesGroupItems = circlesGroup
        .enter()
        .append("g")
    
    circlesGroupItems
        .append("circle")    
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 11)
        .attr("opacity", ".8")
        .classed("stateCircle", true);

    // append our text
    circlesGroupItems
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
        .text(d => d.abbr);

    // Create group for  x axis labels
    var XlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .classed("aText", true);

    var povertyLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("Poverty Rate (%)");

    var ageLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income (Median)");

    // Create group for  y axis labels
    var YlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left}, ${height / 2})`)
        .classed("aText", true);

    var healthcareLabel = YlabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacking Healthcare (%)");

    var obesityLabel = YlabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

    var smokesLabel = YlabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");


    // updateToolTip function above csv import
    var circlesGroupItems = updateToolTip(chosenXAxis, chosenYAxis, circlesGroupItems);
    function debug(msg){
        console.log("BEGIN DEBUG")
        console.log(msg)
        console.log("chosenXAxis", chosenXAxis);
        console.log("chosenYAxis", chosenYAxis);
        console.log("yLinearScale", yLinearScale);
        console.log("xLinearScale", xLinearScale);
        //console.log(`xScale(stateData, ${chosenXAxis})`, xScale(stateData, chosenXAxis))
        //console.log(`yScale(stateData, ${chosenYAxis})`, yScale(stateData, chosenYAxis))        
        console.log("xScale", xScale);
        console.log("yScale", yScale);
        console.log(`d3.extent(stateData, d => d[${chosenXAxis}])`, d3.extent(stateData, d => d[chosenXAxis]));
        console.log(`d3.extent(stateData, d => d[${chosenYAxis}])`, d3.extent(stateData, d => d[chosenYAxis]));
        console.log("circlesGroup", circlesGroup);
        console.log("Dataset", stateData);
        console.log("END DEBUG")
    }
    debug('called before x axis event listener');

    // x axis labels event listener
    XlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log("clickX", value)

                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroupItems = renderCircles(circlesGroupItems, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroupItems = updateToolTip(chosenXAxis, chosenYAxis, circlesGroupItems);

                //debug to view our vars

                debug('called inside x axis event listener');

                // changes classes to change bold text
                switch (chosenXAxis) {
                    case "poverty":
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        break
                    case "age":
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        break
                    case "income":
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        break
                }
            }
        });

    // y axis labels event listener
    YlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                console.log("clickY", value)

                // updates y scale for new data
                yLinearScale = yScale(stateData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderyYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroupItems = renderCircles(circlesGroupItems, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroupItems = updateToolTip(chosenXAxis, chosenYAxis, circlesGroupItems);

                //debug to view our vars

                debug('called inside y axis event listener');

                // changes classes to change bold text
                switch (chosenYAxis) {
                    case "healthcare":
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        break
                    case "obesity":
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        break
                    case "smokes":
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        break
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
