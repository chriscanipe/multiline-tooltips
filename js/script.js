$(document).ready(function() {
    console.log("Hello world.")
});
//Set our margin, width and height
//Pin the width and height to the .chart div
var margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 50
    },
    width = $(".chart").width() - margin.left - margin.right,
    height = $(".chart").height() - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

//Color exists as a Scale. 
var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

//The line function draws points for a path based on the date and 'value' for each row in each series. 
var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return y(d.rate);
    });

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//This is a dictionary object we'll use to get plain language labels.
//Our data comes with the values on the left. We use a key to get the corresponding value:
//Ex.: `labels["CLMUR"]` => "Columbia, Mo."
var labels = {
  "UNRATE" : "U.S.",
  "MOUR" : "Missouri",
  "CLMUR" : "Columbia, Mo."
}



d3.tsv("data/us_mo_co_unemployment.tsv", function(error, data) {
    if (error) throw error;

    var colorDomain = d3.keys(
            data[0]).filter(
            function(key) {
                return key !== "observation_date";
            }
        )
        //pass that to our color scale
    color.domain(colorDomain);

    //Create new property called "date" for each row.
    //assign it the value of d.observation_date after it's been formatted. 
    data.forEach(function(d) {
        d.date = parseDate(d.observation_date);
    });

    //color.domain is an array of our column headers (but not "date")
    //It's the the values we'll be charting.
    //colorDomain is an array of 3 values, which are our column headers. 
    var places = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {
                    date: d.date,
                    rate: +d[name],
                    name : labels[name] //I've added the name to each object, so we can use it in our tooltips.
                };
            })
        };
    });

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));

    y.domain([
        /*d3.min(places, function(c) { 
        return d3.min(c.values, function(v) { 
            return v.rate; 
            }); 
        }),*/
        0,
        d3.max(places, function(c) {
            return d3.max(c.values, function(v) {
                return v.rate;
            });
        })
    ]);

    var total = 1 + 1;
    var string = "1" + "1";

    console.log(total, string);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Unemployment Rate");

    var city = svg.selectAll(".city")
        .data(places)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            return color(d.name);
        });

    city.append("text")
        .datum(function(d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.rate) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) {
            return labels[d.name];
        });




    /* --------------- */
    /* This is the tooltip logic. */
    // For each value in our data, we're adding a dot to the page.
    // In our css, we'll set the .dot to opacity : 0, which makes it invisible.
    // It is, however, still something we can mouseover.
    // So each line has an invisible chain of dots representing each value.
    // When we mouseover it, we'll do 4 things:
    // 1) Make the dot visible.
    // 2) Get the date, place name, and rate for that data point
    // 3) Append those values to the tooltip.
    // 4) Show the tooltip.
    
    // We'll also use a `mousemove` listener to position our dots.
    // And a `mouseout` listener to hide the tooltip and the dot.

    city.selectAll(".dot")
        .data(function(d) {
          //The `city` selection already holds the data for our three lines.
          //So we'll use it to draw our dots. The value for each array of dots
          //will be the array of values attached to each line:
            return d.values;
        })
        .enter().append("circle") //Add a new circle for each data point in the array.
        .attr("class", "dot")
        .attr("cx", function(d) {
            return x(d.date); //Position accordingly.
        })
        .attr("cy", function(d) {
            return y(d.rate); //Position accordingly.
        })
        .attr("r", 5)
        .on("mouseover", function(d) {

            //We're using the Moment.js library to get a month and year for our tooltip.
            //We're using Moment.js because our dates are in the js date format.
            var displayDate = moment(d.date).format("MMM. YYYY");
            var displayVal = d.rate+"%";

            //Append the values to the tooltip with some markup.
            $(".tt").html(
              "<div class='name'>"+d.name+"</div>"+
              "<div class='date'>"+displayDate+": </div>"+
              "<div class='rate'>"+displayVal+"</div>"
            )

            //Show the tooltip.
            $(".tt").show();

            //Make the dot visible.
            d3.select(this).style("opacity", 1);
            
        })
        .on("mousemove", function(d) {

            //Get the mouse position relative to the .chart div.
            //Add the margin.left and margin.top values to make the div set properly in the .chart.
            //Add 10px to each so the tooltip is offset appropriately.
            var xPos = d3.mouse(this)[0] + margin.left + 10;
            var yPos = d3.mouse(this)[1] + margin.top + 10;

            //Use jQuery to position the .tt div with the .chart div.
            //See the CSS for important style info here. 
            $(".tt").css({
                "left": xPos + "px",
                "top": yPos + "px"
            })

        })
        .on("mouseout", function(d) {
            //Turn this dot's opacity back to 0
            //And hide the tooltip.
            d3.select(this).style("opacity", 0);
            $(".tt").hide();
        })

    
});







