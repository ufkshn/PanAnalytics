var UiController = function () {

    var initialize = function(){
        initializeDateRangePickers();
        initializeBootstrapSelect();
        initializeSlimScroll();

        FilterController.init();
        DataController.init();
        ChartController.init();

        ChartController.drawChart('InstallsByDays');
        ChartController.drawChart('InstallsByPlatforms');
        ChartController.drawChart('InstallsByCountries');
    };

    var dataRequestIsChanged = function(){
        ChartController.refreshDataOfChart('InstallsByDays');
        ChartController.refreshDataOfChart('InstallsByPlatforms');
        ChartController.refreshDataOfChart('InstallsByCountries');
    };

    //region Initialize Ui Elements
    var initializeDateRangePickers = function () {
        if (!jQuery().daterangepicker) {
            return;
        }

        $('#defaultrange').daterangepicker({
                opens: (Metronic.isRTL() ? 'left' : 'right'),
                format: 'MM/DD/YYYY',
                separator: ' to ',
                startDate: moment().subtract('days', 29),
                endDate: moment(),
                minDate: '01/01/2012',
                maxDate: '12/31/2018',
            },
            function (start, end) {
                $('#defaultrange input').val(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            }
            ).on('apply.daterangepicker', function(ev, picker) {
                DataController.setDateRange(picker.startDate.format('YYYY-MM-DD'), picker.endDate.format('YYYY-MM-DD'))
        });


        $('#reportrange').daterangepicker({
                opens: (Metronic.isRTL() ? 'left' : 'right'),
                startDate: moment().subtract('days', 29),
                endDate: moment(),
                minDate: '01/01/2012',
                maxDate: '12/31/2014',
                dateLimit: {
                    days: 60
                },
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: true,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                    'Last 7 Days': [moment().subtract('days', 6), moment()],
                    'Last 30 Days': [moment().subtract('days', 29), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                },
                buttonClasses: ['btn'],
                applyClass: 'green',
                cancelClass: 'default',
                format: 'MM/DD/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Apply',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1
                }
            },
            function (start, end) {
                $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            }
        );
        //Set the initial state of the picker label
        $('#reportrange span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
    }

    var initializeBootstrapSelect = function (){
        $('.bs-select').selectpicker(); // init bootstrap select
    };

    var initializeSlimScroll = function(){
        $('.scroller').slimScroll({height: '250px'}); // init slim scroll
    };
    //endregion

    //region Public
    return {
        init: function () {
            initialize();
        },

        dataRequestIsChanged: function(){
            dataRequestIsChanged();
        }
    };
    //endregion

}();