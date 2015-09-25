/**
 * Created by Ufuk on 23.9.2015.
 */
var PanAnalytics = function () {

    //region Public
    return {
        init: function () {
            UiController.init();
        },
        serverUrl: "http://mobuadventurebegins.com/mobu/Dashboard/api/analyticsApi.php?dataRequest="
    };
    //endregion

}();