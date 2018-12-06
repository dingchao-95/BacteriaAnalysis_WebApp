$(function() {
    showPage('home');
  });
  
  const pageFunctions = {};
  
  function registerPage(name, pageFunction) {
    pageFunctions[name] = pageFunction;
  }
  
  $('.page-link').click(function(event) {
    event.preventDefault();
    const name = this.dataset.page;
    $('.active').removeClass('active');
    this.classList.add('active');
    showPage(name);
  });
  
  function showPage(name) {
    $('.page').hide();
    $('.' + name + '-page').show();
  
    pageFunctions[name]();
  }

  //save svg to png
  // I have button in html with id="download"
  d3.select("#downloadSVG")
  .on('click', function(){
      // Get the d3js SVG element and save using saveSvgAsPng.js
      saveSvgAsPng(document.getElementsByTagName("svg")[0], "plot.png", {scale: 2, backgroundColor: "#FFFFFF"});
  })

  
 
