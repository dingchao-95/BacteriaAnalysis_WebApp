function processpage(){
    console.log('this is the process page');
    $('h2').text('Check your process');
    //append dropdownlist
  let dropdown = $('#locality-dropdown');

  dropdown.empty();
  
  dropdown.append('<option selected="true" disabled>Select profile/CSV</option>');
  dropdown.prop('selectedIndex', 0);
  
  const url = 'http://localhost:8081/api/getAllDir';
  
  // Populate dropdown with list of folder names
  $.getJSON(url, function (data) {
      $.each(data, function (key, entry) {
      dropdown.append($('<option></option>').attr('value', entry).text(entry));
      })
  });

  
}



$( document ).ready(function() {
    $('#selectedDir').submit(function(e) {
        var dropdownlist = document.getElementById('locality-dropdown');
        var value = dropdownlist.options[dropdownlist.selectedIndex].value;
        $.ajax({
            url: "/api/selectedDir",
            type: "POST",
            data: $('#selectedDir').serialize(),
            dataType: 'json',
            processData : false,
            contentType : "application/x-www-form-urlencoded",
            success: function(data){
                console.log(data);

                $('#fileLists').empty();
                    $.each(data, function (key, entry) {
                        var filelist = document.getElementById('fileLists');
                        var br = document.createElement('br');
                        var a = document.createElement('a');
                        var linkText = document.createTextNode(entry);
                        a.appendChild(linkText);
                        a.title = "my title text";
                        a.href = "http://localhost/csvfiles/"+value+entry;
                        a.append(br);
                        filelist.appendChild(a);
                    });
                
            },
            error: function(jqXHR, status, err){
                alert("local error callback" + err);
            }
        });
        e.preventDefault();
    });
});




registerPage('process',processpage);