var filePath = 'drugTable.xlsx';
var xhr = new XMLHttpRequest();
xhr.open("GET", filePath, true);
xhr.overrideMimeType('text\/plain; charset=x-user-defined');
xhr.onload = function(e) {
    var data = xhr.responseText;
    // dummyObject
    var f = new File([], 'drugTable.xlsx', {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

    var reader = new FileReader();
    reader.onload = function(e) {
        var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");
        var projectTime = {};
        var wb;
        wb = XLSX.read(data, {bstr, type: 'binary'});
        // do something
        var first_sheet_name = wb.SheetNames[0];
        var worksheet = wb.Sheets[first_sheet_name];
        var htmlstr = XLSX.write(wb,{sheet:"Sheet1", type:'binary',bookType:'html'});
        
        //$('#wrapper')[0].innerHTML += htmlstr;
        var jsonWS = XLSX.utils.sheet_to_json(worksheet);
        var objArr = XLSX.utils.sheet_to_row_object_array(worksheet);
        //$('#wrapper')[0].innerHTML += jsonWS;

        function sanitizeData() {
            var d = [];
            Object.keys(jsonWS).forEach(function(key) {
              d.push(jsonWS[key]);
            });
            return d;
          }

        $(document).ready( function () {
                var table = $('#wrapper').DataTable({
                    dom: 'Bfrtip',
                    buttons: ['excelHtml5', 'copyHtml5'],
                    "ajax":"drugs.json",
                    "columns": [
                        { "data": 'Expt_details'},
                        { "data": 'Therapeutic_Class_effect'},
                        { "data": 'Compound_Name'},
                        { "data": 'Drug'},
                        { "data": 'Conc_of_drug_uM'}
                    ]
                });

              } );
      
           
        console.log(XLSX.utils.sheet_to_json(worksheet));
    };
    reader.readAsBinaryString(f);
};
xhr.send(null);
