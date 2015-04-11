// JavaScript Document
var db = null;
var pages = [];			//list of data-role pages
var links = [];			//list of data-role links
var numLinks =0;
var numPages = 0;
var currentPage = null;
//events
var pageshow = document.createEvent("Event");
pageshow.initEvent("pageshow", true, true);

var pagehide = document.createEvent("Event");
pagehide.initEvent("pagehide", true, true);

var tap = document.createEvent("Event");
tap.initEvent("tap", true, true);

window.addEventListener("DOMContentLoaded", init);

function init() {
	
	//document.addEventListener("deviceready", checkDB); 
	checkDB(); //use for browser
}

function checkDB(){
    //app start once deviceready occurs
    console.info("deviceready");
    db = openDatabase('sample', '', 'Sample DB', 1024*1024);
    if(db.version == ''){
        console.info('First time running... create tables'); 
        //means first time creation of DB
        //increment the version and create the tables
        db.changeVersion('', '1.0',
                function(trans){
                    //something to do in addition to incrementing the value
                    //otherwise your new version will be an empty DB
                    console.info("DB version incremented");
                    //do the initial setup               
                    trans.executeSql('CREATE TABLE names(name_id INTEGER PRIMARY KEY AUTOINCREMENT, name_text TEXT)', [], 
                                    function(tx, rs){
                                        //do something if it works
                                        console.info("Table names created");
                                    },
                                    function(tx, err){
                                        //failed to run query
                                        console.info( err.message);
                                    });
                    trans.executeSql('CREATE TABLE gifts(gift_id INTEGER PRIMARY KEY AUTOINCREMENT, name_id INTEGER, occasion_id INTEGER, gift_idea TEXT)', [], 
                                    function(tx, rs){
                                        //do something if it works
                                        console.info("Table gifts created");
                                    },
                                    function(tx, err){
                                        //failed to run query
                                        console.info( err.message);
                                    });
                    trans.executeSql('CREATE TABLE occasions(occasion_id INTEGER PRIMARY KEY AUTOINCREMENT, occasion_text TEXT)', [], 
                                    function(tx, rs){
                                        //do something if it works
                                        console.info("Table occasions created");
                                    },
                                    function(tx, err){
                                        //failed to run query
                                        console.info( err.message);
                                    });
                    },
                function(err){
                    //error in changing version
                    //if the increment fails
                    console.info( err.message);
                },
                function(){
                    //successfully completed the transaction of incrementing the version number   
                });
        setUpApp();
    }else{
        //version should be 1.0
        //this won't be the first time running the app
        console.info('Version: ', db.version)   
        setUpApp();
    }
}

function setUpApp() {
	pages = document.querySelectorAll('[data-role="page"]');
	numPages = pages.length;
	
	links = document.querySelectorAll('[data-role="link"]');
	numLinks = links.length;
	
	
	//hijack the links here
  for(var lnk=0; lnk<numLinks;lnk++ ){
	if( detectTouchSupport() ){
		links[lnk].addEventListener("touchend", handleTouchEnd); 
		links[lnk].addEventListener("tap", handleLinkClick);	//our custom event
	}else{
    	links[lnk].addEventListener("click", handleLinkClick); 
	}
  }
  
  //add our pageshow events
  document.querySelector("#view").addEventListener("pageshow", showPageOne);
  document.querySelector("#person").addEventListener("pageshow", showPageTwo);
  document.querySelector("#occasion").addEventListener("pageshow", showPageThree);
  document.querySelector("#gift").addEventListener("pageshow", showPageFour);
  console.log("pageshow added");
  
  //add page hide events
  document.querySelector("#view").addEventListener("pagehide", hidePageOne);
  document.querySelector("#person").addEventListener("pagehide", hidePageTwo);
  document.querySelector("#occasion").addEventListener("pagehide", hidePageThree);
  document.querySelector("#gift").addEventListener("pagehide", hidePageFour);

  document.getElementById("viewList").addEventListener("change", listChange)
  
  currentPage = "view";
  showPageOne();    
}

function handleTouchEnd(ev){
	//pass the touchend event directly to a click event
	ev.preventDefault();
	var target = ev.currentTarget;	
	target.dispatchEvent( tap );
	//this will send a click event from the touched tab to 
}

function handleLinkClick(ev){
	ev.preventDefault( );
	var href = ev.currentTarget.href;
	var parts = href.split("#");
    applyCSS( parts[1] );
	var id = "#" + parts[1];
	
	document.querySelector("#" + currentPage).dispatchEvent(pagehide);
	document.querySelector(id).dispatchEvent(pageshow);
	
	currentPage = parts[1];
}

function applyCSS( pageid ){
  	//code to use AJAX to load a url and display it OR just to switch between divs
  	//keep track of the new URL in a global array
  	//add animations to move between divs if you want
  	//use display:block / display: none; if no animations
  	if( pageid == null || pageid == "undefined"){
		//show the home page
		pageid = pages[0].id;
  	}
	//remove active class from all pages except the one called pageid
	for(var pg=0;pg<numPages;pg++){
		if(pages[pg].id === pageid){
			//page needs to show
			pages[pg].className = "show";
			//now add the class active to animate.
			setTimeout(showPage, 20, pages[pg]);
		}else{
			//found the page to hide
			//remove the class active to make it animate off the page
			pages[pg].className = "show";
			//animation off the page is set to take 0.6 seconds
			setTimeout(hidePage, 20, pages[pg]);
		}
	}
	
	//update the style of the tabs too
	for(var lnk=0; lnk<numLinks; lnk++){
		links[lnk].className = "";
	}
	var currTab = document.querySelector('[href="#' + pageid + '"]').className = "activetab";
}

function hidePage(pg){
	pg.className = "hide";
	//this class replaces show
}

function showPage(pg){
	pg.classList.add("active");
}

function showPageOne() {
	document.querySelector("#view").className = "active";
	document.querySelector("#viewTab").className = "activetab";
    
    addViewList();
}

function showPageTwo() {
	document.querySelector("#person").className = "active";
	document.querySelector("#personTab").className = "activetab";
}

function showPageThree() {
	document.querySelector("#occasion").className = "active";
	document.querySelector("#occasionTab").className = "activetab";
}

function showPageFour() {
	document.querySelector("#gift").className = "active";
	document.querySelector("#giftTab").className = "activetab";
    
    addPeopleSelection();
    addOccasionSelection();
}

function hidePageOne() {
	document.querySelector("#view").className = "";
	document.querySelector("#viewTab").className = "";
    
    document.getElementById("viewList").innerHTML = "";
}

function hidePageTwo() {
	document.querySelector("#person").className = "";
	document.querySelector("#personTab").className = "";
}

function hidePageThree() {
	document.querySelector("#occasion").className = "";
	document.querySelector("#occasionTab").className = "";
}

function hidePageFour() {
	document.querySelector("#gift").className = "";
	document.querySelector("#giftTab").className = "";
    
    //clear the lists on page clear
    document.getElementById("listPeople").innerHTML = "";
    document.getElementById("listOccasion").innerHTML = "";
}

//These functions get form values
function setName(form) {
    var personName = form.personSubmit.value;
    //check for user input
    if(form.personSubmit.value == "") {
        alert("Please enter a name!");
    } else {
        form.personSubmit.value = "";
        sqlName(personName);
    }    
}

function setOccasion(frm) {
    var occasionName = frm.occasionSubmit.value;
    
    if(frm.occasionSubmit.value == "") {
        alert("Please enter an occasion!");
    } else {
        frm.occasionSubmit.value = "";
        sqlOccasion(occasionName);
    }    
}    

//function adds person name to DB
function sqlName(personName) {
    db.transaction(function(trans){
        trans.executeSql('INSERT INTO names(`name_text`) VALUES(?)', [personName], 
             function(tx, err){
                //failed to run the query
                console.info( err.message);
            });    
    }, transErr, transSuccess);
}  

function sqlOccasion(occasionName) {
    db.transaction(function(trans){
        trans.executeSql('INSERT INTO occasions(`occasion_text`) VALUES(?)', [occasionName], 
             function(tx, err){
                //failed to run the query
                console.info( err.message);
            });    
    }, transErr, transSuccess);
}    

function addPeopleSelection() {
    db.transaction(function(trans) {
        trans.executeSql('SELECT * FROM names', [],
            function(tx, rs) {
                var rowsLength = (rs.rows.length);
                var output = "";
                
                for(i = 0; i < rowsLength; i++) {
                    output += '<option value="' + (i+1) + '">' + rs.rows.item(i).name_text + '</options>';
                }   
                document.getElementById("listPeople").innerHTML = output;
             },
            function(tx, err) {
                console.info(err.message);
            });    
    }, transErr, transSuccess);    
}  

function addOccasionSelection() {
    db.transaction(function(trans) {
        trans.executeSql('SELECT * FROM occasions', [],
            function(tx, rs) {
                var rowsLength = (rs.rows.length);
                var output = "";
                
                for(i = 0; i < rowsLength; i++) {
                    output += '<option value="' + (i+1) + '">' + rs.rows.item(i).occasion_text + '</options>';
                }   
                document.getElementById("listOccasion").innerHTML = output;
             },
            function(tx, err) {
                console.info(err.message);
            });    
    }, transErr, transSuccess);
} 

function addViewList() {
    db.transaction(function(trans) {
        trans.executeSql('SELECT * FROM occasions', [],
            function(tx, rs) {
                var rowsLength = (rs.rows.length);
                var output = "";
                
                output += '<option value="' + (0) + '">Please select an occasion</options>';
                
                for(i = 0; i < rowsLength; i++) {
                    output += '<option value="' + (i+1) + '">' + rs.rows.item(i).occasion_text + '</options>';
                }   
                document.getElementById("viewList").innerHTML = output;
             },
            function(tx, err) {
                console.info(err.message);
            });    
    }, transErr, transSuccess);
} 

function listChange(ev) {
    var occasionID = ev.currentTarget.value
    var addToGiftList = "";
    var previousName = "";
    
    db.transaction(function(trans){
        trans.executeSql('SELECT * FROM gifts AS g INNER JOIN occasions AS o ON g.occasion_id=o.occasion_id INNER JOIN names AS n ON g.name_id=n.name_id WHERE g.occasion_id='+occasionID+' ORDER BY n.name_id ASC' ,[],
        function(tx, rs) {
            for(var i = 0; i<rs.rows.length; i++) {
                if(rs.rows.item(i).name_text == previousName) {
                    addToGiftList += "<p>" + rs.rows.item(i).gift_idea + "</p>";
                } else {
                    addToGiftList += "<br><h3>" + rs.rows.item(i).name_text + "</h3>";
                    addToGiftList += "<p>" + rs.rows.item(i).gift_idea + "</p>";
                    
                    previousName = rs.rows.item(i).name_text;
                }    
            } 
            document.getElementById("result").innerHTML = addToGiftList;
        }); 
    }, transErr ,transSuccess);    
}    

function submitIdea(form) {
    var giftIdea = form.giftIdea.value;
    var occasionValue = form.occasionList.value;
    var personValue = form.peopleList.value;
    
    if(form.giftIdea.value == "") {
        alert("You need to enter a gift idea!");
    } else {
        form.giftIdea.value = "";
        sqlGift(giftIdea, occasionValue, personValue);
    }    
}  

function sqlGift(giftIdea, occasionValue, personValue) {
    db.transaction(function(trans){
        trans.executeSql('INSERT INTO gifts(`name_id`, `occasion_id`, `gift_idea`) VALUES(' + personValue + ',' + occasionValue + ',' + '"' + giftIdea + '")', [], 
             function(tx, err){
                //failed to run the query
                console.info( err.message);
            });    
    }, transErr, transSuccess);
}    

function transErr(tx, err){
    //a generic function to run when any transaction fails
    //navigator.notification.alert(message, alertCallback, [title], [buttonName])
    console.info("Error processing transaction: " + err);
}

function transSuccess(){
    //a generic function to run when any transaction is completed
    //not something often done generically
}

function detectTouchSupport( ){
  msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
  touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
  return touchSupport;
}