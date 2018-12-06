function report()
{
    $('h2').text('This is the report page.');
    console.log("this is the report page");

    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
        content.style.display = "none";
        } else {
        content.style.display = "block";
        }
    });
    }

    var checkBoxes = document.getElementsByClassName("collapsibleChk");
    var i;

    for(i = 0; i < checkBoxes.length; i++)
    {
        checkBoxes[i].addEventListener("click", function(e){
            e.stopImmediatePropagation();
            
        })
    }

    $('#selectCollapsibleArr').val("Click here to render your report.");
}



$(document).ready(function(){
    var ExptArr = [];
    
    let collapsibleArr = $('#collapsibleArr');
    collapsibleArr.empty();

    $.ajax({
        url: "/api/getExpt",
        type: "GET",
        processData : false,
        contentType : "application/x-www-form-urlencoded",
        success: function(data){

                for(var i = 0; i < data.length; i++)
                {
                    var checkbox = $('<input>', {
                        type:"checkbox",
                        "checked":false,
                        id : "checkbox_"+i,
                        class:"collapsibleChk"
                    })
                    var buttons = $('<button type="button" class="collapsible">Expt_Details: '+ data[i] + '</button>');
                    ExptArr.push(data[i]);
                    var content = $('<div class="content">' + '<div class="collapsibleText" id=textField_'+i+'>' + '</div>');
                    collapsibleArr.append(buttons);
                    buttons.append(checkbox);
                    collapsibleArr.append(content);

                        
                        
                }

                //if arr length not empty for Expt_Details, render tables
                for(var i = 0; i < ExptArr.length; i++)
                {
                    (function(index){
                        $.ajax({
                            url: "/api/getCompoundNames",
                            type: "POST",
                            contentType : "application/json",
                            dataType : "json",
                            data : JSON.stringify({'expt_arr': ExptArr[index]}),
                            success: function(data2){

                                $('#textField_'+index).append(json2table(data2, 'table', 'compoundTable_'+index));
                            },
                            error: function(jqXHR, status, err){
                                alert("local error callback" + err);
                            }
                        });  
                    })(i);
                    
                }
                
            
        },
        error: function(jqXHR, status, err){
            alert("local error callback" + err);
        }
    });

    
    //convert json to table
    function json2table(json, classes, tableId) {
        var cols = Object.keys(json[0]);
        
        var headerRow = '';
        var bodyRows = '';
        
        classes = classes || '';
      
        function capitalizeFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        }
      
        cols.map(function(col) {
          headerRow += '<th>' + capitalizeFirstLetter(col) + '</th>';
        });
      
        json.map(function(row) {
          bodyRows += '<tr>';
      
          cols.map(function(colName) {
            bodyRows += '<td>' + row[colName] + '</td>';
          })
      
          bodyRows += '</tr>';
        });

      
        return '<table class="' +
               classes +
               '" id="' +
               tableId +
               '"><thead><tr>' +
               headerRow +
               '</tr></thead><tbody>' +
               bodyRows +
               '</tbody></table>';
      }


    $('#selectCollapsibleArr').on("click",function(e){
       e.preventDefault();
       e.stopImmediatePropagation();
        submitPDF();

    });

    function submitPDF(){
        var arrOfSelection = [];
        var arrOfTables = [];
        
        $("input:checkbox").each(function(){
            var $this = $(this);
            let i = 0;
            if($this.is(":checked")){
                var test = $this.attr("id");
                var field = test.split('_');
                num = field[1];
                arrOfTables.push(JSON.stringify(makeJsonFromTable('compoundTable_'+num)));
                arrOfSelection.push(parseInt(num)+12);
            }
        });

        console.log(arrOfSelection);
        
        var arrLength = arrOfSelection.length;


      var xhr = $.ajax({
            url: "/api/renderPDF",
            method: "POST",
            processData : false,
            contentType : "application/json",
            xhrFields: {
                responseType: 'blob'
              },
            data : JSON.stringify({arrOfSelection, arrOfTables , arrLength}),
            success: function(data){
                console.log(data.toString('base64'));
                if(data == undefined)
                {
                    xhr.abort();
                }
                else
                {

                    var blob=new Blob([data], {type: 'application/pdf'});
                    var link=document.createElement('a');
                    link.href=window.URL.createObjectURL(blob);
                    link.download="Label"+".pdf";
                    collapsibleArr.append(link);
                    window.open(link.href);

                }
                
            },
            complete: function(data){
                
            },
            error: function(jqXHR, status, err){
                alert("local error callback" + err);
            }});

    }

    
    
});

//floating buttons
$(window).scroll(function() {
    var winScrollTop = $(window).scrollTop();
    var winHeight = $(window).height();
    var floaterHeight = $('#floater').outerHeight(true);
    //true so the function takes margins into account
    var fromBottom = 20;

    var top = winScrollTop + winHeight - floaterHeight - fromBottom;
    $('#floater').css({'top': top + 'px'});
});


registerPage('report', report);