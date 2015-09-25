/**
 * Created by Ufuk on 23.9.2015.
 */
var DataController = function () {

    //region Variables
    var filter;
    var dateStart;
    var dateEnd;
    //endregion

    var initialize = function(){

    };

    var getDataFromServer = function(dataName, callback){

        $.get( PanAnalytics.serverUrl + encodeURIComponent(JSON.stringify(getDataRequest(dataName))))
            .done(function(data) {
                data = JSON.parse(data);
                callback(data);
            });
    };

    //region Getters
    var getDataRequest = function(dataName){
        var dataRequest = {};

        dataRequest.dataName = dataName;
        dataRequest.filter = filter;
        dataRequest.dateStart = dateStart;
        dataRequest.dateEnd = dateEnd;

        return dataRequest;
    };
    //endregion

    //region Setters
    var setDateRange = function(start, end){
        dateStart = start;
        dateEnd = end;
        UiController.dataRequestIsChanged();
    };

    var setFilter = function(newFilter){
        filter = newFilter;
        UiController.dataRequestIsChanged();
    };
    //endregion

    //region Public
    return {
        init: function () {
            initialize();
        },

        //region Public Methods
        //ChartController calls method when it requires data for charts
        getDataRequest: function(dataName){
            return getDataRequest(dataName);
        },

        getDataFromServer: function(dataName, callback){
            return getDataFromServer(dataName, callback);
        },

        //UiController calls method when date range picker value changes
        setDateRange: function(start, end){
            setDateRange(start, end);
        },

        //FilterController calls method when filter changes
        setFilter: function(filter){
            setFilter(filter);
        }
        //endregion
    };
    //endregion

}();