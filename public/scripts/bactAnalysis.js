d3.csv('Bact_int_pvals.csv', function (data) {
    // Variables
    
    var body = d3.select('#chart')
      var margin = { top: 50, right: 50, bottom: 50, left: 50 }
      var height = 650 - margin.top - margin.bottom
      var width = 1450 - margin.left - margin.right
      // Scales
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20)

    //threshold
    var significanceThreshold = 0.05, // significance threshold to colour by
        foldChangeThreshold = 1.0
    

    var xScale = d3.scaleLinear()
      .range([0,width])


    var yScale = d3.scaleLinear()
      .range([height,0])

      //square root scale
      var radius = d3.scaleSqrt()
		  .range([2,5])

      // SVG
      var svg = body.append('svg')
          .attr('height',height + margin.top + margin.bottom)
          .attr('width',width + margin.left + margin.right)
          .append('g')
          .attr('transform','translate(' + margin.left + ',' + margin.top + ')')


          var xAxis = d3.axisBottom(xScale).ticks(12);
          var yAxis = d3.axisLeft(yScale).ticks(12 * height / width);


    
    //csv file append
    data.forEach(function(d){
      d.Label = d.Label;
      d.Xvalue = +d.Xvalue;
      d.Yvalue = +d.Yvalue;
   })
      

   var xExtent = d3.extent(data, function (d) { return d.Xvalue; });
        var yExtent = d3.extent(data, function (d) { return d.Yvalue; });
    //domain
    xScale.domain(d3.extent(data,function(d){
      return d.Xvalue;
    })).nice()

    yScale.domain(d3.extent(data,function(d){
      return d.Yvalue;
    })).nice()

    // //clip path
    // var clip = svg.append("defs").append("svg:clipPath")
    //         .attr("id", "clip")
    //         .append("svg:rect")
    //         .attr("width", width )
    //         .attr("height", height )
    //         .attr("x", 0) 
    //         .attr("y", 0)
   
    svg.append('g').append('clipPath')
       .attr('id','clip')
       .append('rect')
       .attr('height',height)
       .attr('width', width)
       
    //svg
    // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis. 
		svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x axis')
    .attr('id', 'axis--x')
    .call(xAxis)

    // y-axis is translated to (0,0)
    svg.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'y axis')
      .attr('id', 'axis--y')
      .call(yAxis)

      //tooltip
      var tooltip = d3.select("#chart").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);  
      

      // var bubble = svg.selectAll('.bubble')
			// .data(data)
			// .enter().append('circle')
			// .attr('class', 'bubble')
			// .attr('cx', function(d){return xScale(d.Percchange_Area)})
			// .attr('cy', function(d){ return yScale(d.pvalue_Area) })
			// .attr('r', 4)
      // .style('fill', function(d){ return colorScale(d.drugName) })
      // .on('mouseover', function(d) {
      //   tooltip.transition()
      //     .duration(200)
      //     .style("opacity", .9);
      //   tooltip.html(d.drugName + "<br/>" + d.Percchange_Area + "<br/>" + d.pvalue_Area)
      //     .style("left", (d3.event.pageX) + "px")
      //     .style("top", (d3.event.pageY - 28) + "px");
      //   })
      // .on('mouseout', function(d) {
      //   tooltip.transition()
      //     .duration(500)
      //     .style("opacity", 0);
      //   })

      // bubble.append('title')
      //   .attr('x', function(d){ return radius(d.pvalue_Area) })
      //   .text(function(d){
      //     return [d.drugName , '\n', 
      //             d.pvalue_Area]
      //   })

      // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
      svg.append('text')
      .attr('x', 10)
      .attr('y', 10)
      .attr('class', 'label')
      .text('-log(Adjusted P-value)')

      svg.append('text')
      .attr('x', width)
      .attr('y', height - 10)
      .attr('text-anchor', 'end')
      .attr('class', 'label')
      .text('Mean change in Bacterial Intensity wrt DMSO (%)')
      
      
    
      

      //brush tools

    var brush = d3.brush().extent([[0,0],[width,height]]).on("end", brushended),
    idleTimeout,
    idleDelay = 350;

    


    svg.append("g")
    .attr("class", "brush")
    .call(brush)

    //draw the circles
    var bubble = svg.append('g')
    .attr('class','circlesContainer')

    bubble.selectAll('.bubble')
			.data(data)
			.enter().append('circle')
			.attr('class', bubbleClass)
			.attr('cx', function(d){return xScale(d.Xvalue)})
			.attr('cy', function(d){ return yScale(d.Yvalue) })
			.attr('r', 4)
      .style('fill', function(d){ return colorScale(d.Label) })
      .on('mouseover', function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.Label + "<br/>" + d.Xvalue + "<br/>" + d.Yvalue)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
      .on('mouseout', function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        })

       
      
      function brushended() {
        var s = d3.event.selection;
        if (!s) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay)
          xScale.domain(d3.extent(data, function (d) { return d.Xvalue; })).nice()
          yScale.domain(d3.extent(data, function (d) { return d.Yvalue; })).nice()
        } else {
          xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale))
          yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale))
          svg.select(".brush").call(brush.move, null)
        }
        zoom()
      }
      
      function idled() {
        idleTimeout = null;
      }
      
      function zoom() {
        var t = svg.transition().duration(750);
        svg.select("#axis--x").transition(t).call(xAxis)
        svg.select("#axis--y").transition(t).call(yAxis)
        svg.selectAll("circle").transition(t)
            .attr("cx", function(d) { return xScale(d.Xvalue) })
            .attr("cy", function(d) { return yScale(d.Yvalue) })
      }
      
      //legend
      var outerSvg = d3.select("#legend1")
      .append("g")
      .attr("width", 500)
      .attr("height", 200)
      .style("background-color", "darkkhaki")
    
      var foreign = outerSvg.append("foreignObject")
      .attr("x", 300)
      .attr("y", 10)
      .attr("width", 150)
      .attr("height", 180)
      .append("xhtml:div")
      .style("max-height", "180px")
      .style("max-width", "150px")
      .style("overflow-y", "scroll")
      
      var innerSvg = foreign.append("svg")
      .attr("width", 133)
      .attr("height", 11435)
      .style("background-color", "powderblue")
      
      var texts = innerSvg.selectAll("legend")
      .data(colorScale.domain())
      .enter()
      .append("text")
      .attr("x", 40)
      .attr("y", (d,i)=> 20 + 30*i)
      .text(function(d){ return d; })
      .on('click', function(type){
        d3.selectAll('.bubble')
          .style('opacity', 0.025)
          .filter(function(d){
            return d.Label == type;
          })
          .style('opacity', 1) 
      })
      
      var rects = innerSvg.selectAll("legend")
      .data(colorScale.domain())
      .enter()
      .append("rect")
      .attr("x", 10)
      .attr("y", (d,i)=> 8 + 30*i)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", colorScale)
      .on('click', function(type){
        d3.selectAll('.bubble')
          .style('opacity', 0.025)
          .filter(function(d){
            return d.Label == type;
          })
          .style('opacity', 1)
      })
      

       //threshold lines
       var thresholdLines = svg.append('g')
       .attr('class', 'thresholdLines')

      // add horizontal line at significance threshold
      thresholdLines.append("svg:line")
          .attr('class', 'threshold')
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", yScale(2.6))
          .attr("y2", yScale(2.6))

      // add vertical line(s) at fold-change threshold (and negative fold-change)
      [foldChangeThreshold, -1 * foldChangeThreshold].forEach(function(threshold) {
          thresholdLines.append("svg:line")
              .attr('class', 'threshold')
              .attr("x1", xScale(threshold))
              .attr("x2", xScale(threshold))
              .attr("y1", 0)
              .attr("y2", height)
      })

      function bubbleClass(d) {
        if (d.Xvalue <= 2.6 && Math.abs(d.Xvalue) >= foldChangeThreshold) return 'bubble.sigfold';
        else if (d.Yvalue <= significanceThreshold) return 'bubble.sig';
        else if (Math.abs(d.Xvalue) >= foldChangeThreshold) return 'bubble.fold';
        else return '.bubble';
    }


  })