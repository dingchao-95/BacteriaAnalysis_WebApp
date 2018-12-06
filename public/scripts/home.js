function home() {
    $('h2').text('Home');
    console.log('This is the home page!');
    $('#chart').hide();
    $('#resetBtn').hide();
    $('#uploadBtn').hide();
    
  }
  
  registerPage('home', home);

//instantiate all values of row data
var exptDetails = document.getElementById('exptDetails');
var theraClass = document.getElementById('theraClass');
var compName = document.getElementById('compName');
var drug = document.getElementById('drug');
var concDrug = document.getElementById('concDrug');

//instantiate error msg
var noValsErr = document.getElementById('rowValsErr');


// Get the modal
var modal = document.getElementById('myModal');

//get button that adds rows
var addrows = document.getElementById('addRows');

// Get the button that opens the modal
var btn = document.getElementById("addbtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

//when user clicks on add rows, functions does next
$("#addnewRows").submit(function(e) {
  e.preventDefault();
  var xhr = $.ajax({
    url: "/api/addRows",
    headers: { 
      'Content-Type': undefined
    },
    type: "POST",
    data: new FormData(this),
    processData: false,
    contentType: false,
    success: function(data){
      if(exptDetails && theraClass && compName && drug && concDrug)
      {
        noValsErr.style.display = "none";
      }
      else
      { 
        noValsErr.style.display = "block";
        xhr.abort();
      }
    }
  });

});

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}