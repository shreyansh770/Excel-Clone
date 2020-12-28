let $=require("jquery")//used for DOM manupulation
let fs=require("fs");
let dialog = require("electron").remote.dialog;//to open dialog box
cd

$("document").ready(function(){
    let db;
    let lsc;//last selected cell


    //new //open //save

    $(".new").on("click",function(){
        db=[];//push row
        let allRows=$(".cells .row");
        //console.log(allRows.length)
        for(let i=0;i<allRows.length;i++){
            let row=[];//push col
            let allColsInRows=$(allRows[i]).find(".cell")
            for(let j=0;j<allColsInRows.length;j++){
               let address= getAdressFromRowIdColId(i,j);
                let cellObject={
                    name:address,
                    value:"",
                    formula:"",
                    parents:[],
                    children:[],
                    cellFormatting:{bold:false,underline:false,italic:false},
                    cellAlignment:"center",
                    fontSize:"16px",
                    textColor:"black",
                    background:"white",
                    textStyle:"Times New Roman"
                };
                row.push(cellObject);
                $(allColsInRows[j]).html("");//clearing text in each cell if new is clicked
                
                $(allColsInRows[j]).css("font-weight","normal");
                $(allColsInRows[j]).css("cellAlignment" ,"normal");
                $(allColsInRows[j]).css("text-decoration","normal");
                $(allColsInRows[j]).css("text-align","center");
                $(allColsInRows[j]).css("font-size","16px")
                $(allColsInRows[j]).css("color","black");
                $(allColsInRows[j]).css("background","white");
            }
            db.push(row);
        } 
        $(".address .cell-formula").val("")
    })

    $(".open").on("click",function(){

      let paths = dialog.showOpenDialogSync();//open files and give array of paths
      let path = paths[0];

      let data= fs.readFileSync(path);

      data = JSON.parse(data);
      db=data;
   
      let allRows=$(".cells .row");

      for(let i=0;i<allRows.length;i++){
            
           let allCellsInRow=$(allRows[i]).find(".cell");
           for(let j=0;j<allCellsInRow.length;j++){
               let value=db[i][j].value;
               $(allCellsInRow[j]).html(value)
               $(allColsInRows[j]).css("font-weight",db[i][j].cellFormatting.bold ? "bold":"normal");
               $(allColsInRows[j]).css("cellAlignment" ,db[i][j].cellFormatting.italic ? "italic":"normal");
               $(allColsInRows[j]).css("text-decoration",db[i][j].cellFormatting.underline ? "underline":"normal");
               $(allColsInRows[j]).css("text-align",`${db[i][j].cellAlignment}`);
               $(allColsInRows[j]).css("font-size",`${db[i][j].fontSize}`)
               $(allColsInRows[j]).css("color",`${db[i][j].textColor}`);
               $(allColsInRows[j]).css("background",`${db[i][j].background}`)

           }

      }
       
        
    })

    $(".save").on("click",function(){
        console.log("SAVE")
        let path= dialog.showSaveDialogSync();//will give the path of the file in which the db is save
        let data=JSON.stringify(db)
        fs.writeFileSync(path,data);
        alert("SAVED")
    })

    $("#cell-font-slider").on("change",function(){
        let value = $(this).val()
        $(lsc).css("font-size",`${value}px`)
        let cellObject=getCellObject(lsc);
        cellObject.fontSize=`${value}px`
        setHeight(lsc);
    })

     //text and background color

     $("#cell-text").on("change",function(){
            let color= $(this).val();
            $(lsc).css("color",`${color}`);
            let cellObject=getCellObject(lsc);

            cellObject.text=color;
     })

     $("#cell-background").on("change",function(){
        let color= $(this).val();
        $(lsc).css("background",`${color}`);
        let cellObject=getCellObject(lsc);

        cellObject.background=color;
    })



     //text-style

     $("#cell-font").on("click",function(){
        let style=$(this).val();
        $(lsc).css("font-family",`${style}`);

        let cellObject=getCellObject(lsc);

        cellObject.textStyle=style;
    })


    //file//home

    $("#file").on("click",function(){
          
        $("#home").removeClass("menu-active");
        $(".home-menu-options").removeClass("menu-options-active")
        $(this).addClass("menu-active");
        $(".file-menu-options").addClass("menu-options-active")


    })

    $(".bold").on("click",function(){
       let cellObject=getCellObject(lsc);
       $(lsc).css("font-weight",cellObject.cellFormatting.bold ? "normal":"bold" );
       cellObject.cellFormatting.bold=!cellObject.cellFormatting.bold;//true<=>false
       setHeight(lsc);
    })

    $(".underline").on("click",function(){
        let cellObject=getCellObject(lsc);
        $(lsc).css("text-decoration",cellObject.cellFormatting.underline ? "none":"underline" );
        cellObject.cellFormatting.underline=!cellObject.cellFormatting.underline;
    })

    $(".italic").on("click",function(){
        let cellObject=getCellObject(lsc);
        $(lsc).css("font-style",cellObject.cellFormatting.italic ? "normal":"italic" );
        cellObject.cellFormatting.italic=!cellObject.cellFormatting.italic;
    })

     //left center right alignment

    $(".cell-align div").on("click",function(){
       let alignment= $(this).attr("class")//center//left//right

       $(lsc).css("text-align",`${alignment}`)
       let cellObject=getCellObject(lsc);
       cellObject.cellAlignment=alignment;
       
    })


    $("#home").on("click",function(){
        $("#file").removeClass("menu-active");
        $(".file-menu-options").removeClass("menu-options-active")
        $(this).addClass("menu-active");
        $(".home-menu-options").addClass("menu-options-active")   
        
    })

    $(".cell").on("click",function(){
        $(this).addClass("active");
       let rowId= Number($(this).attr("r-id"));
       let colId= Number($(this).attr("c-id"));

       //Coverts int->char
       let address=String.fromCharCode(65+colId) +(rowId+1);
        $(".address").val(address)//input  me address dikhna
        let cellObject=getCellObject(this)
        $(".cell-formula").val(cellObject.formula)
    })

    $(".cell").on("blur",function(){
        $(this).removeClass("active");
         lsc=this;
         let value=$(this).text();

         let cellObject=getCellObject(this) ;

         if(value!=cellObject.value){
          cellObject.value=value;
          // cell out of focus and value is changed for the cell

          if(cellObject.formula){
              removeFormula(cellObject);
              $(".cell-formula").val(cellObject.formula)
          }
             updateChildren(cellObject);
         }
         
    })

    $(".cell-formula").on("blur",function(){
        let formula =  $(this).val();
        //falsy value=>undefined ,flase,null

            let cellObject=getCellObject(lsc);
            if(cellObject.formula!=formula){
                removeFormula(cellObject);//formula ke hisab se parents hatnege
                if(formula==""){
                    $(lsc).text("");
                    return;
                }
            }
           addFormula(formula);//formula add ho jaega
           updateChildren(cellObject)
           console.log(db)

    })
     
    //scrolling
    $(".content").on("scroll",function(){
     
        let topoffSet=$(this).scrollTop();//displacement from top in pixel
        let leftoffSet=$(this).scrollLeft();//displacement from left in pixel

         $(".top-left-cell , .top-row ").css('top',topoffSet+"px")
         $(".top-left-cell , .left-col ").css('left',leftoffSet+"px")
    })
   
    //keyup:when key press is over
   $(".cell").on("keyup",function(){
      setHeight(this)
   })


   //sets the height of lsc according to the text
    function setHeight(elem){
        let height= $(elem).height();
        let rowId= $(elem).attr("r-id");
        let leftCol=$(".left-col-cell")[rowId];
        $(leftCol).height(height);
    }
     

    function removeFormula(cellObject){
        
         cellObject.formula="";//formula khali krna

         //remove self  from children array  of parent
         for(let i=0;i<cellObject.parents.length;i++){
             let parentName=cellObject.parents[i];
             let {rowId,colId}=getRowIdColIdFromAddress(parentName);
             let parentCellObj=db[rowId][colId];
             let newChildrenOfParent=parentCellObj.children.filter(function(child){
                 return child!=cellObject.name;
             });
             parentCellObj.children=newChildrenOfParent;

         }
         cellObject.parents=[];//khud ke parents ko hatana
    }
   
    
    function addFormula(formula){
        let cellObject=getCellObject(lsc);
        cellObject.formula=formula;
        solveFormula(cellObject)

    } 

    function solveFormula(cellObject){
       let formula=cellObject.formula;

       let fComps=  formula.split(" ");
       //[ "(", "A1", "+" , "A2", ")" ]

       for(let i=0;i<fComps.length;i++){
           let fComp=fComps[i];

           let cellName=fComp[0]//string array

           if(cellName >= "A" && cellName <= "Z"){

           let {rowId,colId} = getRowIdColIdFromAddress(fComp);
           
           let parentCellObj =  db[rowId][colId];

           // Creating dependencies
           parentCellObj.children.push(cellObject.name);//B1
           cellObject.parents.push(fComp);//A1

           let value = Number(parentCellObj.value);// 1,2,3,4....

           formula = formula.replace(fComp,value);//A1->1

           }
       }
        
         let value=eval(formula);//infix evaluation
         cellObject.value=value;//db push
         $(lsc).text(value);//UI pe visible
    } 

    function reCalculate(cellObject){
        let formula=cellObject.formula;

        let fComps=  formula.split(" ");
        for(let i=0;i<fComps.length;i++){
            let fComp=fComps[i];

            let cellName=fComp[0]//string array
 
            if(cellName >= "A" && cellName <= "Z"){
 
            let {rowId,colId} = getRowIdColIdFromAddress(fComp);
            
            let parentCellObj =  db[rowId][colId];
            let value = Number(parentCellObj.value);
            formula = formula.replace(fComp,value);
        }

      }
      let value=eval(formula);
      cellObject.value=value;
      let {rowId,colId}=getRowIdColIdFromAddress(cellObject.name);
      $(`.cell[r-id=${rowId}][c-id=${colId}]`).text(value);
    }

    function updateChildren(cellObject){
        let children=cellObject.children;
        for(let i=0;i<children.length;i++){
            let childName= children[i];
            let {rowId,colId}=getRowIdColIdFromAddress(childName);
            let childObject=db[rowId][colId];
            reCalculate(childObject)//formula fetch, formula evaluation, db update, ui update
            updateChildren(childObject);//Tree//DFS
        }
        
    }

    //database
    function init(){
      $(".new").trigger("click")//each time new excel will get open
    };
    init();


    //utility function
    function getAdressFromRowIdColId(i,j){
        //i=0;j=0
     let row=i+1;
     let col=String.fromCharCode(65+j);
     let address=`${col}${row}`;
     return address;

    }

    function getRowIdColIdFromAddress(address){
        
        //address:-'A1','A2' these items
        let row = Number(address.substring(1))-1;//0
        let col = address.charCodeAt(0)-65;//0
        return {
            rowId:row,
            colId:col
        };
    }

    function getCellObject(elem){
        let rowId= Number($(elem).attr("r-id"));
        let colId= Number($(elem).attr("c-id")); 

        let cellObject=db[rowId][colId]

        return cellObject
    }

})