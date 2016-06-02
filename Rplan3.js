/* Good resources for Javascript OOP:

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
https://www.youtube.com/watch?v=coIsvOMYEi0 (most simple form)

*/

// http://peter-ertl.com/jsme/JSME_2016-05-21/index.html (Link for JSME molecular editor)



var mwfinal = 400; 
var mwstart = 200; 

$(function(){
    
    document.getElementById("generate").addEventListener("click", function(event){
        
        // Get number of steps user has typed in
        var steps = document.getElementById("steps").value;         
        
        if (steps == ""){
            
            alert("Please provide number of synthetic steps");
        }      
        
               
        // Try to create elements and add after wrapper div.. 
        
        
        // Object for repeated building of structure and yield segments of page depending on how many steps the user inputs. Need to use OOP here as required to repeatedly reuse code to build html string within for loop below (ie proportionally to number of reaction steps)       
        function pages(step){            
            
            this.step = step; 
            
            // Function to insert in JME window. Note, had to change id to jsme_container1 in html and script to enable function to place canvas in correct position. 
            
            this.draw = function jsmeOnLoad () {
                jsmeApplet = new JSApplet.JSME("jsme_container1", "300px", "250px");
            }            
            
            this.html = function(){
                return "<div id ='wrapper' class = 'insert'><div id = 'box'><div id='jsme_container1'></div></div><div id = 'field-wrap'><div class='form-groups' style = 'width:150px;'><input autocomplete='off' class =" + "'" + this.step + "'"  + "autofocus class='form-control' name='moles' placeholder='Moles' type='text'readonly/></div></div>"; 
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
            console.log(html); 
            $(html).insertAfter('#wrapper');
             
            var arrow = page.arrow();
            $(arrow).insertAfter('#wrapper');
            page.draw(); 
            reaction--;           
        }
        
        //var test = document.getElementById()
        
        
        // Now add event listener for calculate button 
        document.getElementById("calculate").addEventListener("click", function(event){
        
            console.log("calculate button clicked"); 
            
            // Get value that user typed in for desired target compound mass 
            var quantity = document.getElementById("quantity").value;        

            if (quantity == ""){
                alert("Please provide a desired final product mass");             
            }

            // Calculate moles of compound based on mass user inputs 
            var units = document.getElementById("grams").checked;  

            // If user has selected milligram quantities, then convert units to grams. 
            if (units == false){
                quantity = quantity/1000; 
            }      
           

            var moles = quantity / mwfinal;             
            
            // Now insert moles into field 
            document.getElementById("moles_start").value = moles;
            
            // Counter to actually determine if work has been done on orginal moles value
            var count = 0;             
            
            var group = document.getElementsByClassName(steps);                                 
            
            for (var i = 1; i <= steps; i++){            

                // Group yield and moles together by class into array. 0 => yield, 1 => moles
                var group = document.getElementsByClassName(i); 
                console.log(group[0]); 
                                
                var reaction_yield = group[0].value;
                console.log(reaction_yield);                 
        
                if (reaction_yield == ""){
                    alert("Please provide an estimated yield for each reaction"); 
                }
                
                if (reaction_yield != ""){
                
                    // Now input moles value for that intermediate
                    moles = moles / (reaction_yield/100);
                    moles = moles.toFixed(4);
                    group[1].value = moles; 
                    count++; 
                }      
            
            }        
        
            console.log(count); 

            // If do not check work has been done on first moles value, then program just inputs this into start field regardless 
            if (count > 0){
                
                 moles = moles * mwstart;
                 moles = moles.toFixed(2);
                 document.getElementById("start").value = moles; 
            }           
            
       });
       
        
    });   
})