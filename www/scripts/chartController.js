var ChartController = function() {

    //region Variables
    var isReady = false;
    var chartsWillBeDrownWhenReady = [];
    var chartsDrown = [];
    var defaultBalloonText = "<span style='font-size:13px;'>[[title]] in [[category]]:<br/><span style='font-size:18px; font-weight: bold'>[[value]]</span></span>";
    //endregion

    var initialize = function(){
        AmCharts.ready(function() {
            //Chart system is ready
            isReady = true;

            //Draw charts in queue
            for (var i = 0; i < chartsWillBeDrownWhenReady.length; i++){
                var chartSignature = chartsWillBeDrownWhenReady.pop();
                drawChart(chartSignature.chartName, chartSignature.dataRequest)
            }
        });
    };

    //region Draw Chart Logic
    var drawChart = function(chartName, dataRequest){

        if (typeof dataRequest === 'undefined') {
            dataRequest = DataController.getDataRequest(chartName);
        }

        var chartSignature = {"chartName": chartName, "dataRequest": dataRequest};

        //Check if charts system is ready!
        if (!isReady){
            //Chart system is NOT ready enqueue chart
            console.log("AmCharts is NOT ready. Enqueue chart")
            chartsWillBeDrownWhenReady.push(chartSignature);
            return;
        }

        //Check if chart is already drown
        if (chartsDrown[chartName] != undefined){
            if (chartsDrown[chartName].dataRequest == dataRequest){
                console.log("Chart is already drown");
            }
            else{
                console.log("Chart is already drown but data request is changed!")
                fillDataToChart(chartName, dataRequest);
            }
            return;
        }

        //Create chart
        chart = new AmCharts.AmSerialChart();

        //region Common Settings
        chart.pathToImages = Metronic.getGlobalPluginsPath() + "amcharts/amcharts/images/";
        chart.autoMargins = false;
        chart.theme = "light";
        chart.marginTop = 10;
        chart.marginBottom = 26;
        chart.marginLeft = 30;
        chart.marginRight = 8;
        chart.fontFamily = "Open Sans";
        chart.color = "#888";
        chart.startDuration = 0.2; //Total animation time
        chart.dataDateFormat = "YYYY-MM-DD";

        //region Legend
        var legend = new AmCharts.AmLegend();
        legend.horizontalGap = 10;
        legend.maxColumns = 6;
        legend.position = "bottom";
        legend.useGraphSettings = true;
        legend.markerSize = 10;
        chart.addLegend(legend);
        //endregion

        //endregion

        //region Data Loader Settings
        chart.dataLoader = {
            format:"json",
            showCurtain: true,
            showErrors: true
        };
        //endregion

        ApplyChartSettings(chart, chartName);

        //Draw chart
        chart.write(chartName);

        //Put chart to drown chart list
        chartsDrown[chartName] = {};
        chartsDrown[chartName].chart = chart;

        //Fill the data
        fillDataToChart(chartName);

        //Setup full screen button
        $('#' + chartName).closest('.portlet').find('.fullscreen').click(function () {
            chart.invalidateSize();
        });

    };

    var fillDataToChart = function(chartName, dataRequest){
        if (chartsDrown[chartName] == undefined || chartsDrown[chartName].chart == undefined){
            console.warn("Chart was not created!")
            return;
        }

        if (typeof dataRequest === 'undefined') {
            dataRequest = DataController.getDataRequest(chartName);
        }

        chartsDrown[chartName].dataRequest = dataRequest;

        var chart = chartsDrown[chartName].chart;
        chart.dataLoader.url = PanAnalytics.serverUrl + encodeURIComponent(JSON.stringify(dataRequest));
        chart.dataLoader.loadData();
        chart.validateData();
    };
    //endregion

    //region Chart Settings
    var ApplyChartSettings = function(chart, chartName){
        switch (chartName){
            case "InstallsByDays":
                InstallsByDaysSettings(chart);
                break;
            case "InstallsByPlatforms":
                InstallByPlatformsSettings(chart);
                break;
            case "InstallsByCountries":
                InstallsByCountriesSettings(chart);
                break;
            default:
                console.warn("Chart settings could NOT be found!")
                break;
        }
    };

    var InstallsByDaysSettings = function(chart){

        SetCategory(chart, "RegOn", true);
        AddStackAxis(chart, "regular");

        AddColumnGraph(chart, "Total", "Daily Installs");

        //region Setup Toggle Stack Type Button
        $('#InstallsByDays').closest('.portlet').find('.stackType').click(function () {
            if (chart.valueAxes[0].stackType == "regular"){
                chart.valueAxes[0].stackType = "100%";
            }
            else{
                chart.valueAxes[0].stackType = "regular";
            }
            chart.validateNow();
        });
        //endregion

        return chart;
    };

    var InstallByPlatformsSettings = function(chart){

        SetCategory(chart, "RegOn", true);
        AddStackAxis(chart, "regular");

        AddColumnGraph(chart, "iOS", "iOS Installs");
        AddColumnGraph(chart, "Android", "Android Installs");
        AddLineGraph(chart, "Total", "Total Installs");

        //region Setup Toggle Stack Type Button
        $('#InstallsByPlatforms').closest('.portlet').find('.stackType').click(function () {
            if (chart.valueAxes[0].stackType == "regular"){
                chart.valueAxes[0].stackType = "100%";
            }
            else{
                chart.valueAxes[0].stackType = "regular";
            }
            chart.validateNow();
        });
        //endregion

        return chart;
    };

    var InstallsByCountriesSettings = function(chart){

        SetCategory(chart, "RegOn", true);
        AddStackAxis(chart, "regular");

        DataController.getDataFromServer('MostPopularCountries', function(data){
            for(var i = 0; i < data.length; i++){
                AddColumnGraph(chart, data[i]["Country"], data[i]["Country"]);
            }
            AddColumnGraph(chart, "Others", "Others");
            AddLineGraph(chart, "Total", "Total");

            chart.validateData();
        }, chart);

        //region Setup Toggle Stack Type Button
        $('#InstallsByCountries').closest('.portlet').find('.stackType').click(function () {
            if (chart.valueAxes[0].stackType == "regular"){
                chart.valueAxes[0].stackType = "100%";
            }
            else{
                chart.valueAxes[0].stackType = "regular";
            }
            chart.validateNow();
        });
        //endregion

        return chart;
    };
    //endregion

    //region Graph Helpers
    var AddColumnGraph = function(chart, valueField, title){
        var graph = new AmCharts.AmGraph();
        graph.title = title;
        graph.valueField = valueField;
        graph.type = "column";
        graph.fillAlphas = 1;
        graph.balloonText = defaultBalloonText;
        chart.addGraph(graph);
    };

    var AddLineGraph = function(chart, valueField, title){
        var graph = new AmCharts.AmGraph();
        graph.title = title;
        graph.valueField = valueField;
        graph.bullet = "round";
        graph.balloonText = defaultBalloonText;
        graph.lineThickness = 5;
        graph.bulletSize = 20;
        graph.hideBulletsCount = 50;
        chart.addGraph(graph);
    };

    var AddStackAxis = function(chart, stackType){
        var valueAxis = new AmCharts.ValueAxis();
        valueAxis.stackType = stackType;
        valueAxis.axisAlpha = 0.3;
        valueAxis.dashLength = 1;
        chart.addValueAxis(valueAxis);
    };

    var SetCategory = function(chart, valueField, isDate){
        chart.categoryField = "RegOn";
        var categoryAxis = chart.categoryAxis;
        categoryAxis.parseDates = isDate; // as our data is date-based, we set parseDates to true
        categoryAxis.gridAlpha = 0.15;
        categoryAxis.axisColor = "#DADADA";
    };
    //endregion

    //region Public
    return {
        //main function to initiate the module

        init: function() {
            initialize();
        },

        drawChart: function(chartName, dataRequest){
            drawChart(chartName, dataRequest);
        },

        refreshDataOfChart: function(chartName){
            fillDataToChart(chartName);
        }
    };
    //endregion

}();