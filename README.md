### Multi-series line chart with Tooltips.

This extends the Multi-series line example to include tooltips. There are other ways to create tooltips, but this is my favorite method: add a plain-old html tootlip div that sits inside of the chart div and use JavaScript to show, hide, populate, and position the tooltip div as you mouseover elements in the chart. I like this method because it keeps the tooltip in conventional html and allows you to use a text wrap. SVG text doesn't like to wrap. The steps:

1) Add a tooltip div inside of your .chart container.
```
<div class="col-md-12 chart">
    <div class="tt"></div>
</div>
```
2) Give the tooltip a css position of 'absolute' and the .chart div a position of relative.
```
.chart {
  height: 500px;
  position: relative;
}

.tt {
	background-color: #fff;
	padding: 8px;
	outline: 1px solid #ccc;
	display: none;
	position: absolute;
}
```
3) Use the mouseover listener to get the x and y positions of the element when mousing over and pass those values to the tooltip styles to position it.

```
.on("mousemove", function(d) {

    var xPos = d3.mouse(this)[0] + margin.left + 10;
    var yPos = d3.mouse(this)[1] + margin.top + 10;

    $(".tt").css({
        "left": xPos + "px",
        "top": yPos + "px"
    })
})
```

4) Pass the data values (Ex.: date and unemployment rate) to the tooltip as html (Notice I'm using the Moment.js library to get format the date for display):
```
var displayDate = moment(d.date).format("MMM. YYYY");
var displayVal = d.rate+"%";

//Append the values to the tooltip with some markup.
$(".tt").html(
  "<div class='name'>"+d.name+"</div>"+
  "<div class='date'>"+displayDate+": </div>"+
  "<div class='rate'>"+displayVal+"</div>"
)
```

5) Show the tooltip on mouseover
6) Hide the tooltip on mouseout

Comments are included through the `index.html`, `script.js` and `style.css` files.


Data is from [FRED](US, Missouri, Columbia Unemployment.
https://research.stlouisfed.org/fred2/graph/?chart_type=line&recession_bars=on&log_scales=&bgcolor=%23e1e9f0&graph_bgcolor=%23ffffff&fo=Open+Sans&ts=12&tts=12&txtcolor=%23444444&show_legend=yes&show_axis_titles=yes&drp=0&cosd=1976-01-01%2C1976-01-01&coed=2016-02-01%2C2016-02-01&height=445&stacking=&range=&mode=fred&id=MOURN%2CUNRATE&transformation=lin%2C&nd=%2C&ost=-99999%2C&oet=99999%2C&lsv=%2C&lev=%2C&scale=left%2C&line_color=%234572a7%2C&line_style=solid%2C&lw=2%2C&mark_type=none&mw=2&mma=0%2C&fml=a%2C&fgst=lin%2C&fgsnd=2007-12-01%2C&fq=Monthly%2C&fam=avg%2C&vintage_date=%2C&revision_date=%2C&width=670#
)


