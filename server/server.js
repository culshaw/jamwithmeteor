samples_arr = [
    {name: '4OP-FM', category: 'drums', path: 'samples/drum-samples/4OP-FM/'},
    {name: 'Acoustic Kit', category: 'drums', path: 'samples/drum-samples/acoustic-kit/'},
    {name: 'Bongos', category: 'drums', path: 'samples/drum-samples/Bongos/'},
    {name: 'Breakbeat (8)', path: 'samples/drum-samples/breakbeat8/'},
    {name: 'CR78', category: 'drums', path: 'samples/drum-samples/CR78/'},

];

categories = [
    {id: 'drums', taken: true},
    {id: 'guitar', taken: true},
    {id: 'piano', taken: true},
    {id: 'bass', taken: false}
];




// Methods
Meteor.methods({
    addSample: function(options) {
        options = options || {};
        return Samples.insert({
            name: options.name,
            path: options.path,
            used: false
        });
    },
    takeSample: function(options) {
        // Options list
        // - id
        // - direction

        var category = Categories.findOne({taken: false});
        Categories.update(category, {taken: true});

        console.log(category)
        
        // sampleCollection = Samples.findOne({category: category.name})
        // if(sampleCollection) {
            
        //     Samples.update(sampleCollection, {used: true});
        //     return sampleCollection;
        // } else {
        return {id: 0, category: category};
        //}
    }
})

Meteor.startup(function () {

    // Empty remote storage.
    Samples.remove({});
    Categories.remove({});

    for(var i=0; i < categories.length; i++) {
        item = categories[i];

        Categories.insert({
            name: item.id,
            taken: item.taken
        })
    }

    for(var i=0; i < samples_arr.length; i++) {
        item = samples_arr[i];

        Samples.insert({
            name: item.name,
            path: item.path,
            used: false
        });  
    }
    // samples_arr.forEach(function(item) {
    //     // Meteor.call('addSample', {
    //     //     name: item.name,
    //     //     path: item.path
    //     // })
    

        
    // });

    // $.getJSON('//magicseaweed.com/api/2/forecast/?spot_id=992&callback=?', function(forecastData) {
    //     console.log(forecastData)
    //     forecastData.forEach(function(forecastLocationData) {
    //         Meteor.call('addForecast', {
    //             timestamp: forecastLocationData.timestamp,
    //             fadedRating: forecastLocationData.fadedRating,
    //             solidRating: forecastLocationData.solidRating,
    //             swellHeight: forecastLocationData.swell.maxBreakingHeight,
    //             //swellUnit: options.swellUnit,
    //             pressure: forecastLocationData.condition.pressure,
    //             //pressureUnit: forecastLocationData.condition.pressureUnit,
    //             temperature: forecastLocationData.condition.temperature
    //             //temperatureUnit: options.temperatureUnit
    //         })
    //     })
    // })

    // Fetch list of most popular places based on our mongo instance

    // Display the top 10 in the browser

    // Allow the user to click 'more' to load the next few.
});

// All Tomorrow's Parties -- server

// All todays swells.
// Meteor.publish('forecasts', function () {
//     return Forecasts.find({});
// })

// Meteor.publish("locations", function () {
//     return Locations.find({}, {sort: {"votes": -1, "title": 1}});
// });