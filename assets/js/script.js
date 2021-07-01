var wikiContainer = $('#wiki');
var wikiImages = $('#wiki-images');
var wikiParagraphs = $('#wiki-paragraphs');
var breweryList = $('#brewery-list');
var breweryArray = [];
var searchForm = document.querySelector('#search-form');

searchForm.addEventListener('submit', searchFormSubmit);

async function getWikiPage(page) {
    $.ajax({
        type: "GET",
        url: "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + page + "&callback=?",
        contentType: "application/json; charset=utf-8",
        async: true,
        dataType: "json",
        success: function (data) {
            var wikiContainer = data.parse.text["*"];
            var pageSection = $('<div></div>').html(wikiContainer);
            wikiImages.html($(pageSection).find('img').eq(0));
            wikiParagraphs.html($(pageSection).find('p').slice(0,3));
        },
        error: function (error) {}
    });
};

//getWikiPage("Atlanta");

async function getBreweryData(region) {
    var regionType = document.querySelector('#format-input').value;
    if (regionType != "state" && regionType != "city")
        regionType = "city";

    var url = "https://api.openbrewerydb.org/breweries?by_"+ regionType + "=" + region;
    //return fetch Promise of region's brewery data
    return fetch(url)
    .then(function (response) {
        //console.log(response);
        return response.json();
    })
    .then(function (breweryData) {
        console.log("Region results");
        console.log(breweryData);

       displayBreweries(breweryData)
        return breweryData;
    });
};

function displayBreweries(breweryData){
    //clears previous breweries on page except for original (used as prototype)
    breweryList.empty();
    for (var i = 0; i < breweryData.length; i++){
        var breweryTitle = $(document.createElement("a"));
        breweryTitle.attr("href", "#search");
        breweryTitle.attr("name", breweryData[i].name);
        breweryTitle.brewPhone = breweryData[i].phone;
        breweryTitle.brewWebsite = breweryData[i].website_url;
        breweryTitle.brewStreet = breweryData[i].street;
        breweryTitle.text(breweryData[i].name);
        breweryTitle.css("display", "inline-block");
        $('#list-header').css("display", "block");
        $('#wiki').css("display", "block");
        $('.grid-container').css("grid-template-columns", "0fr 1fr 1fr");
        breweryTitle.on("click", 
            {brewPhone: breweryData[i].phone, brewWebsite: breweryData[i].website_url, brewStreet: breweryData[i].street,
                brewType: breweryData[i].brewery_type, brewState: breweryData[i].state, brewCity: breweryData[i].city}, 
            displayBreweryInfo);
          
        breweryList.append(breweryTitle);  
    }
}

function displayBreweryInfo (e) {
    brewInfo = $("#brew-info");
    //clear anything in info box
    brewInfo.empty();
    $('.grid-container').css("grid-template-columns", "1fr 1fr 1fr");
    $('#brew-pic').css("display", "block");
    brewInfo.css("background-color", "rgba(0,0,0,.60)");

    //create & display title
    var breweryName = $("<h4>" + this.name + "</h4>");
    breweryName.css("color", "white");
    brewInfo.append(breweryName);

    //create & display type (if it exists)
    if (e.data.brewType != null) {
        var brewType = $("<p>Brew Type: " + capitalize(e.data.brewType) + "</p>");
        brewType.css("color", "white");
        brewInfo.append(brewType);
    }

    //create & display street (if it exists)
    if (e.data.brewStreet != null) {
        var brewStreet = $("<p>Address: " + capitalize(e.data.brewStreet) + "</p>");
        brewStreet.css("color", "white");
        brewInfo.append(brewStreet);
    }

    //create & display city (if it exists)
    if (e.data.brewCity != null) {
        var brewCity = $("<p>City: " + capitalize(e.data.brewCity) + "</p>");
        brewCity.css("color", "white");
        brewInfo.append(brewCity);
    }

    //create & display state (if it exists)
    if (e.data.brewState != null) {
        var brewState = $("<p>State: " + capitalize(e.data.brewState) + "</p>");
        brewState.css("color", "white");
        brewInfo.append(brewState);
    }

    //create & display phone number (if it exists)
    if (e.data.brewPhone != null) {
        var brewPhone = $("<p>Phone Number: " + e.data.brewPhone + "</p>");
        brewPhone.css("color", "white");
        brewInfo.append(brewPhone);
    }

    //create & display link to website (if it exists)
    if (e.data.brewWebsite != null) {
        var breweryWebsite = $("<a>Website: " + e.data.brewWebsite + "</a>");
        breweryWebsite.attr("href", e.data.brewWebsite);
        breweryWebsite.css("color", "cyan");
        brewInfo.append(breweryWebsite);
    }
}

function searchFormSubmit(event) {
    event.preventDefault();

    var searchRegion = document.querySelector('#search-input').value;
    getBreweryData(searchRegion);
    getWikiPage(searchRegion);
  }

  function capitalize(word) {return word[0].toUpperCase() + word.slice(1);}