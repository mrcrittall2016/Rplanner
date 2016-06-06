/* 

This version of Rplanner implements most of required features ie embedded drawing objects, ability to drag structures from object to object, smiles calculation and molecular weight retrieval via AJAX

*/

// http://peter-ertl.com/jsme/JSME_2016-05-21/index.html (Link for JSME molecular editor)

// Globals for start and end molecular weights 
var mwfinal; 
var mwstart;

// Array for holding JME drawing objects
var drawing_objects = []; 

// Number of reaction steps
var steps;

// Quantity of final target required
var quantity; 

$(function(){
 
    
    document.getElementById("generate").addEventListener("click", function(event){        
        
                
        // Get number of steps user has typed in
        steps = document.getElementById("steps").value;         
        
        if (steps == ""){
            
            alert("Please provide number of synthetic steps");
        }      
        
               
        // Try to create elements and add after wrapper div.. 
        
        
        // Object for repeated building of structure and yield segments of page depending on how many steps the user inputs. Need to use OOP here as required to repeatedly reuse code to build html string within for loop below (ie proportionally to number of reaction steps)       
        function pages(step){            
            
            this.step = step; 
            
            // Function to insert in JME window. Note, had to change id to jsme_container1 in html and script to enable function to place canvas in correct position.            
            
            this.draw = function jsmeOnLoad () {                
                
                document.JME2 = new JSApplet.JSME("jsme_container1", "300px", "250px");            
               
                
                // Add identifier to JME object 
                document.JME2["step"] = this.step; 
                
                // Push on to global array
                drawing_objects.push(document.JME2);                 
               
            }
            
            // First lot of html to display
            this.initial = function(){
                
                return "<div id = 'field-wrap'><div class='form-groups' style ='padding-bottom:5px;'><input autocomplete='off' autofocus class='form-control' name='Quantity'placeholder='Quantity required' type= 'text' id = 'quantity' readonly/></div><div class='radio-inline'><label><input id='grams' type='radio' name='optradio' value='grams' checked='checked'>grams</label></div><div class='radio-inline' style = 'margin-bottom:10px;'><label><input id='milligrams' type='radio' name='optradio' value='milligrams'>milligrams</label></div><div class='form-groups' style = 'width:150px;'><input autocomplete='off' id = 'moles_start' autofocus class='form-control' name='moles' placeholder='Moles' type='text' readonly/></div><div class='form-groups' style = 'width:150px; padding-top:5px;'><input autocomplete='off' id = 'smiles_start' autofocus class='form-control' name='smiles' placeholder='Smiles' type='text' readonly/></div><div class='form-groups' style = 'width:150px; padding-top:5px;'><input autocomplete='off' id = 'mw_start' autofocus class='form-control' name='MW' placeholder='Molecular Weight' type='text' readonly/></div></div>"                
                
            }
            
            // html to be generated on the fly when user clicks generate button
            this.html = function(){
                return "<div id ='wrapper' class = 'insert'><div id = 'box'><div id='jsme_container1'></div></div><div id = 'field-wrap'><div class='form-groups' style = 'width:150px;'><input autocomplete='off' class =" + "'" + this.step + "'"  + "autofocus class='form-control' name='moles' placeholder='Moles' type='text'readonly/></div><div class='form-groups' style = 'width:150px; padding-top:5px;'><input autocomplete='off' class =" + "'" + this.step + "'" + "autofocus class='form-control' name='smiles' placeholder='Smiles' type='text' readonly/></div><div class='form-groups' style = 'width:150px; padding-top:5px;'><input autocomplete='off' class =" + "'" + this.step + "'" + "autofocus class='form-control' name='MW' placeholder='Molecular Weight' type='text' readonly/></div>"; 
            };        
        
            this.arrow = function(){
                
                return "<div id ='yield_wrap'><div id = 'field-wrap' style ='top:45px;'><div class='form-groups'><input autocomplete='off' class =" + "'" + this.step + "'"  + "autofocus class='form-control' name='yield' placeholder='yield' type='text'/></div></div></div>";
            };


            this.button = function(){
                
                return "<div id = 'wrapper2' style = 'margin-top:30px;'><div class='form-groups' style ='padding-bottom:5px;'><input autocomplete='off' autofocus class='form-control' id = 'start' name='Starting material' placeholder='Starting material required' type='text' readonly/> grams</div><button class='btn btn-default' type='submit' id = 'calculate' style = 'margin-left:50px;'><span aria-hidden='true' class='glyphicon glyphicon-log-in'></span>Calculate</button></div>"; 
            }
            
        };         
            
        
        // Once click generate button, delete it and steps field to prevent being clicked again.         
        if (steps != ""){            
            
            // Array of elements wish to remove
            var removal = ["#steps", "#generate"]; 

            for (var i in removal){            

                $(removal[i]).remove();

            }    
            
            var page = new pages(steps);
            
            // Obtain html to show in first wrapper 
            var initial_html = page.initial(); 
            console.log(initial_html); 
            
            // Put initial html after first box id
            $(initial_html).insertAfter('#box');            
            
            // Obtain html for calculate button           
            var button = page.button(); 
            
            // Insert calculate button
            $(button).insertAfter('#wrapper');             
            
            // Activate quantity field
            $("#quantity").attr("readonly", false);
        }   
         
        
        var reaction = steps; 
        
        
        // Then add html for other intermediates, SM and yield arrows. Note that when creating variable to store object information, name of variable cannot be the same as the constructor 
        for (var i = 0; i < steps; i++){            
                        
            // JQuery to insert html after a certain tag... http://www.mkyong.com/jquery/jquery-after-and-insertafter-example/        
            var page = new pages(reaction);
                        
            var html = page.html();
           
            $(html).insertAfter('#wrapper');
             
            var arrow = page.arrow();
            $(arrow).insertAfter('#wrapper');            
            page.draw();  
            reaction--;        
        } 
        
        
        
        // Now add event listener for calculate button 
        document.getElementById("calculate").addEventListener("click", function(event){        
           
            
            // Get value that user typed in for desired target compound mass 
            quantity = document.getElementById("quantity").value;        

            if (quantity == ""){
                alert("Please provide a desired final product mass");             
            }

            // Calculate moles of compound based on mass user inputs 
            var units = document.getElementById("grams").checked;  

            // If user has selected milligram quantities, then convert units to grams. 
            if (units == false){
                quantity = quantity/1000; 
            }      
           
            // Also get smiles for each chemical structure and use to calculate/display molecular weight (saved in global variables)  
            getSmiles(steps);           
            
       });
       
        
    });   
})


// Function to get smiles from drawing object.. 
function getSmiles(steps) {  
    
   // For each smiles field 
   for (var i = 0; i <= steps; i++){       
       
       // For first JME object in array
       if (drawing_objects[i].step == 0){           
           
           var smiles = drawing_objects[i].smiles();
           var field = document.getElementById("smiles_start");
           field.value = smiles;
           var mw = document.getElementById("mw_start"); 
           
           // This is first JME object so must be final structure/target molecule. Note success is a callback function executed on return of molecular weight value via AJAX
           molecular_weight(smiles, mw, i, success);
           
           
       }
       
       // For all other JME objects        
       else if (drawing_objects[i].step > 0){           
           
           // For all other JME objects in array
           var smiles = drawing_objects[i].smiles();           
           var group = document.getElementsByClassName(i);           
           group[2].value = smiles;  
           // Note success is a callback function executed on return of molecular weight value via AJAX
           molecular_weight(smiles, group[3], i, success);           
           
       }
       
   }; 
    
}

function molecular_weight(smiles, MW_field, index, success){
    
    // Calculate the molecular weight from the following URL: https://cactus.nci.nih.gov/chemical/structure/NCc1ccccc1/mw (ie pass in SMILES then retrieve mw variable via AJAX call)   
    
    // See http://www.w3schools.com/jquery/jquery_ajax_get_post.asp for AJAX calls           
    var URL = "https://cactus.nci.nih.gov/chemical/structure/" + smiles +"/mw"; 
    
    $.get(URL, function(data, status){
               
       if (status == "success"){

           // Returns all html for that page
           
           // If successfully returned and have obtained molecular weight then use success callback and function within to calculate starting material required
           success(data, MW_field, index); 
       }

       else {

           alert("A molecular weight could not be calculated for" + smiles); 
       }

   });
    
}

function success(data, MW_field, index){    
    
    MW_field.value = data;
    var values; 
    
    if (index == 0){
        
        mwfinal = data;        
        values = 1;
    }
    
    else if (index == steps){
        
        mwstart = data;         
        values = 2;
    } 
    
    
    // If have values for both mwfinal and mwstart, perform calculation
    if (values == 2){        
        
        combine(mwfinal, mwstart, quantity);        
        
    }   
}

function combine(mwfinal, mwstart, quantity){
    
    var moles = quantity / mwfinal;    

    // Now insert moles into field 
    document.getElementById("moles_start").value = moles;

    // Counter to actually determine if work has been done on orginal moles value
    var count = 0;             

    var group = document.getElementsByClassName(steps);                                 

    for (var i = 1; i <= steps; i++){            

        // Group yield and moles together by class into array. 0 => yield, 1 => moles
        var group = document.getElementsByClassName(i);         

        var reaction_yield = group[0].value;                      

        if (reaction_yield == ""){
            alert("Please provide an estimated yield for each reaction"); 
        }

        if (reaction_yield != ""){

            // Now input moles value for that intermediate
            moles = moles / (reaction_yield/100);            
            group[1].value = moles; 
            count++; 
        }      

    }         


    // If do not check work has been done on first moles value, then program just inputs this into start field regardless 
    if (count > 0){

         moles = moles * mwstart;
         moles = moles.toFixed(2);
         document.getElementById("start").value = moles; 
    } 
}





