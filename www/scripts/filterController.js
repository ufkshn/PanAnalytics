/**
 * Created by Ufuk on 23.9.2015.
 */
var FilterController = function () {

    //region Variables
    var filter;
    var cookieName = "panAnalyticsFilter";
    //endregion

    var initialize = function(){

        var cookie = $.cookie(cookieName);
        if (cookie == undefined || cookie == null){
            filter = {};
            saveFilterData();
        }
        else{
            filter = JSON.parse(cookie);
            fillFilterModal();
        }

        fillFilterListInDashboard();

        $("#btnClearFilters").button().click(function(){
            resetFilters();
        });

        $("#btnRemoveAllFilters").button().click(function(){
            resetFilters();
        });

        $("#btnSaveFilters").button().click(function(){
            saveFilters();
        });
    };

    //region Handling Filters
    var resetFilters = function(){
        $("#platformOperator").val("=").selectpicker('refresh');
        $("#platformValue").val("-1").selectpicker('refresh');

        $("#countryOperator").val("=").selectpicker('refresh');
        $("#countryValue").val("ALL").selectpicker('refresh');

        $("#referrerOperator").val("=").selectpicker('refresh');
        $("#referrerValue").val("");

        $("#subRefererOperator").val("=").selectpicker('refresh');
        $("#subRefererValue").val("");

        $("#userPaidOperator").val(">=").selectpicker('refresh');
        $("#userPaidValue").val("");

        $("#userProgressOperator").val(">=").selectpicker('refresh');
        $("#userProgressValue").val("");

        filter = {};

        saveFilterData();

        fillFilterListInDashboard();
    };

    var saveFilters = function(){

        filter = {};

        var platformValue = $("#platformValue").find('option:selected').val();
        if (platformValue != "-1")
        {
            filter.platformValue = platformValue;
            filter.platformOperator = $("#platformOperator").find('option:selected').val();
        }

        var countryValue = $("#countryValue").find('option:selected').val();
        if (countryValue != "ALL")
        {
            filter.countryValue = countryValue;
            filter.countryOperator = $("#countryOperator").find('option:selected').val();
        }

        var referrerValue = $("#referrerValue").val();
        if (referrerValue != "")
        {
            filter.referrerValue = referrerValue;
            filter.referrerOperator = $("#referrerOperator").find('option:selected').val();
        }

        var subReferrerValue = $("#subReferrerValue").val();
        if (subReferrerValue != "")
        {
            filter.subReferrerValue = subReferrerValue;
            filter.subReferrerOperator = $("#subReferrerOperator").find('option:selected').val();
        }

        var userPaidValue = $("#userPaidValue").val();
        if (userPaidValue != "")
        {
            filter.userPaidValue = userPaidValue;
            filter.userPaidOperator = $("#userPaidOperator").find('option:selected').val();
        }

        var userProgressValue = $("#userProgressValue").val();
        if (userProgressValue != "")
        {
            filter.userProgressValue = userProgressValue;
            filter.userProgressOperator = $("#userProgressOperator").find('option:selected').val();
        }

        saveFilterData();

        fillFilterListInDashboard();
    };

    var saveFilterData = function(){
        //Save to cookie
        $.cookie(cookieName, JSON.stringify(filter), { expires: 7, path: '/' });
        DataController.setFilter(filter);
    };
    //endregion

    //region Update UI elements
    var fillFilterListInDashboard = function(){
        var text = "";
        var subFilterCount = 0;

        if (filter.platformOperator != undefined && filter.platformValue != undefined)
        {
            text += "Platform " + filter.platformOperator + " '" + getPlatformName(filter.platformValue) + "', ";
            subFilterCount++;
        }

        if (filter.countryOperator != undefined && filter.countryValue != undefined)
        {
            text += "Country " + filter.countryOperator + " '" + filter.countryValue + "', ";
            subFilterCount++;
        }

        if (filter.referrerOperator != undefined && filter.referrerValue != undefined)
        {
            text += "Referrer " + filter.referrerOperator + " '" + filter.referrerValue + "', ";
            subFilterCount++;
        }

        if (filter.subReferrerOperator != undefined && filter.subReferrerValue != undefined)
        {
            text += "SubReferrer " + filter.subReferrerOperator + " '" + filter.subReferrerValue + "', ";
            subFilterCount++;
        }

        if (filter.userPaidOperator != undefined && filter.userPaidValue != undefined)
        {
            text += "User Paid " + filter.userPaidOperator + " " + filter.userPaidValue + " USD, ";
            subFilterCount++;
        }

        if (filter.userProgressOperator != undefined && filter.userProgressValue != undefined)
        {
            text += "User Progress " + filter.userProgressOperator + " " + filter.userProgressValue + ", ";
            subFilterCount++;
        }

        if (subFilterCount > 0){
            text = "<b>" + subFilterCount + " Active Filters -></b> " + text.substr(0, text.length-2);
            $("#btnRemoveAllFilters").show();
        }
        else{
            text = "No Active Filters!";
            $("#btnRemoveAllFilters").hide();
        }

        $("#filterList").html(text);

    };

    var fillFilterModal = function(){
        if (filter.platformOperator != undefined){
            $("#platformOperator").val(filter.platformOperator).selectpicker('refresh');
        }
        if (filter.platformValue != undefined){
            $("#platformValue").val(filter.platformValue).selectpicker('refresh');
        }

        if (filter.countryOperator != undefined){
            $("#countryOperator").val(filter.countryOperator).selectpicker('refresh');
        }
        if (filter.countryValue != undefined){
            $("#countryValue").val(filter.countryValue).selectpicker('refresh');
        }

        if (filter.referrerOperator != undefined){
            $("#referrerOperator").val(filter.referrerOperator).selectpicker('refresh');
        }
        if (filter.referrerValue != undefined){
            $("#referrerValue").val(filter.referrerValue);
        }

        if (filter.subReferrerOperator != undefined){
            $("#subReferrerOperator").val(filter.subReferrerOperator).selectpicker('refresh');
        }
        if (filter.subReferrerValue != undefined){
            $("#subReferrerValue").val(filter.subReferrerValue);
        }

        if (filter.userPaidOperator != undefined){
            $("#userPaidOperator").val(filter.userPaidOperator).selectpicker('refresh');
        }
        if (filter.userPaidValue != undefined){
            $("#userPaidValue").val(filter.userPaidValue);
        }

        if (filter.userProgressOperator != undefined){
            $("#userProgressOperator").val(filter.userProgressOperator).selectpicker('refresh');
        }
        if (filter.userProgressValue != undefined){
            $("#userProgressValue").val(filter.userProgressValue);
        }
    };
    //endregion

    //region Helpers
    var getPlatformName = function(platform) {
        var platformName = "";
        switch (platform) {
            case "0":
                platformName = "iOS";
                break;
            case "100":
                platformName = "Android";
                break;
            case "200":
                platformName = "Browser";
                break;
            case "210":
                platformName = "Canvas";
                break;
            case "255":
                platformName = "Editor";
                break;
        }
        return platformName;
    };
    //endregion

    //region Public
    return {
        //main function to initiate the module
        init: function () {
            initialize();
        }
    };
    //endregion
}();