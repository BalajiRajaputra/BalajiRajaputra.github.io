// Width and height
var chart_width     =   880;
var chart_height    =   540;
var color           =   d3.scaleQuantize().range([
    'rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)',
    'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)',
    'rgb(203,24,29)', 'rgb(165,15,21)', 'rgb(103,0,13)'
]);

// Projection
var projection      =   d3.geoAlbersUsa()
    .translate([ 0,0 ]);
var path            =   d3.geoPath( projection );
    // .projection( projection );

var lowColor = '#f9f9f9'
var highColor = '#bc2a66'


// Create SVG
var svg             =   d3.select("#chart")
    .append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

var zoom_map        =   d3.zoom()
    .scaleExtent([ 0.5, 3.0 ])
    .translateExtent([
        [ -1000, -500 ],
        [ 1000, 500 ]
    ])
    .on( 'zoom', function(){
     console.log( d3.event );
    var offset      =   [
        d3.event.transform.x,
        d3.event.transform.y
    ];
    var scale       =   d3.event.transform.k * 1100;

    projection.translate( offset )
        .scale( scale );

    svg.selectAll( 'path' )
        .transition()
        .attr( 'd', path );

    svg.selectAll( 'circle' )
        .transition()
        .attr( "cx", function(d) {
            return projection([d.Longitude, d.Latitude])[0];
        })
        .attr( "cy", function(d) {
            return projection([d.Longitude, d.Latitude])[1];
        });
});

var barTooltip = d3.select("body").append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0)
	    .style("width",800);
		
var map             =   svg.append( 'g' )
    .attr( 'id', 'map' )
    .call( zoom_map )
    .call(
        zoom_map.transform,
        d3.zoomIdentity
            .translate( chart_width / 2.2, chart_height / 2.1 )
            .scale( 1 )
    );

map.append( 'rect' )
    .attr( 'x', 0 )
    .attr( 'y', 0 )
    .attr( 'width', chart_width )
    .attr( 'height', chart_height )
    .attr( 'opacity', 0 );

// Data

	
d3.json( 'data/Med.json', function( zombie_data ){
    color.domain([
		
        d3.min( zombie_data, function(d){
			
			       return Math.sqrt(parseInt(d.MedicaidAmountReimbursed) * 0.00000005 );
			
        }),
        d3.max( zombie_data, function(d){
            return Math.sqrt(parseInt(d.MedicaidAmountReimbursed) * 0.00000005 );
        })
    ]);
	
	var minVal =  d3.min( zombie_data, function(d){
				return Math.sqrt(parseInt(d.MedicaidAmountReimbursed) * 0.00000005 )})
	var maxVal = d3.max( zombie_data, function(d){
				return Math.sqrt(parseInt(d.MedicaidAmountReimbursed) * 0.00000005 )})
	var minVal1 =  d3.min( zombie_data, function(d){
							return parseInt(d.MedicaidAmountReimbursed)})
	var maxVal1 = d3.max( zombie_data, function(d){
							return parseInt(d.MedicaidAmountReimbursed)})
	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
	
	
	
    d3.json( 'data/us.json', function( us_data ){
        us_data.features.forEach(function(us_e, us_i){
            zombie_data.forEach(function(z_e,z_i){
				
                if( us_e.properties.name !== z_e.StateName ){
                    return null;
                }
                //us_data.features[us_i].properties.num   =   Math.sqrt(parseInt(z_e.MedicaidAmountReimbursed) * 0.00000005) ;
				us_data.features[us_i].properties.num   =   parseInt(z_e.MedicaidAmountReimbursed);
				
            });
        })

        map.selectAll( 'path' )
            .data( us_data.features )
            .enter()
            .append( 'path' )
            .attr( 'd', path )
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d,i) {  //console.log ('d.properties.num   ----'+ Math.sqrt(parseInt(d.properties.num) * 0.00000005))
			//return ramp(d.properties.num)
			return ramp(Math.sqrt(parseInt(d.properties.num) * 0.00000005))
			})
			.append( 'title' )
            .text(function(d){
							
               return "State - " + d.properties.name + "  &  Total Medicare Amount Reimbursed - $" + d.properties.num;
			   
				
			})
			.append("title");
			
	  		  
       /*     .attr( 'fill', function( d ){
                var num         =   d.properties.num;
				//console.log (' StateName + d.properties.num  -' + d.StateName +' - '+ d.properties.num);
                return num ? color( num ) : '#ddd';
            })*/
 			// **added new code for state name 
	

        //Draw_State();
		
    });
	
	// add a legend
	var w = 140, h = 300;

	var key = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend");

		var legend = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
	legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", highColor)
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lowColor)
			.attr("stop-opacity", 1);

		key.append("rect")
			.attr("width", w - 100)
			.attr("height", h)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)");

		var y = d3.scaleLinear()
			.range([h, 0])
			.domain([minVal1, maxVal1]);

		var yAxis = d3.axisRight(y);

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)		.attr("spreadMethod", "pad");			
	
	
});

function Draw_State(){
    d3.json( 'data/Med.json', function( State_data ){
        map.selectAll("circle")
            .data(State_data)
            .enter()
            .append( "circle" )
            .style( "fill", "#9D497A" )
		   // .style( "fill", "steelblue" )
            .style( "opacity", 0.8 )
            .attr( 'cx', function( d ){
				
                return projection([d.Longitude, d.Latitude])[0];
				
            })
            .attr( 'cy', function( d ){
                return projection([d.Longitude, d.Latitude])[1];
            })
            .attr( 'r', function(d){
                return Math.sqrt(parseInt(d.MedicaidAmountReimbursed) * 0.00000008 );
            })
          
		  .append( 'title' )
           .text(function(d){
               return "State - " + d.StateName + " & Total Medicare Amount Reimbursed - $" + d.MedicaidAmountReimbursed;
			   //return "State - " + d.StateName;
           });
		   
		   
			   
    });
}

