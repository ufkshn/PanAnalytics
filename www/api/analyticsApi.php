<?php
/**
 * Created by PhpStorm.
 * User: Ufuk
 * Date: 22.9.2015
 * Time: 17:23
 */
header("Access-Control-Allow-Origin: *");

class AnalyticsApi
{

    private $db;

    // Constructor - open DB connection
    function __construct()
    {
        $this->db = new mysqli('localhost', 'root', 'oGSxkVmEIS', 'MoBuAnalytics');
        $this->db->autocommit(FALSE);
    }

    // Destructor - close DB connection
    function __destruct()
    {
        $this->db->close();
    }
    function getMostPopularCountries($dataRequest){
        $filter = $this->generateSQLFromDataRequest($dataRequest, 'RegisteredOn');
        if ($filter != "")
            $filter = "WHERE $filter";

        //Find most popular 5 countries
        $sql = "SELECT
                    Country,
                    Count(Country) AS Occurance
                FROM
                    UserLogs
                $filter
                GROUP BY Country
                ORDER BY Occurance DESC
                LIMIT 5";
        $result = mysqli_query( $this->db, $sql);

        $data = array();
        while($row = mysqli_fetch_assoc($result))
        {
            $data[] = $row;
        }
        return $data;
    }

    function getInstallsByDays($dataRequest){

        $filter = $this->generateSQLFromDataRequest($dataRequest, 'RegisteredOn');
        if ($filter != "")
            $filter = "WHERE $filter";

        $sql = "SELECT
                    Date(RegisteredOn) AS RegOn,
                    Count(DeviceID) AS Total
                FROM UserLogs
                $filter
                GROUP BY DAY(RegisteredOn)";

        //echo $sql;

        $result = mysqli_query( $this->db, $sql);

        $data = array();
        while($row = mysqli_fetch_assoc($result))
        {
            $data[] = $row;
        }
        return $data;
    }

    function getInstallsByPlatforms($dataRequest){

        $filter = $this->generateSQLFromDataRequest($dataRequest, 'RegisteredOn');
        if ($filter != "")
            $filter = "WHERE $filter";

        $sql = "SELECT
                    Date(RegisteredOn) AS RegOn,
                    SUM(CASE WHEN Platform = 0 THEN 1 ELSE 0 END) AS iOS,
                    SUM(CASE WHEN Platform = 100 THEN 1 ELSE 0 END) AS Android,
                    Count(DeviceID) AS Total
                FROM UserLogs
                $filter
                GROUP BY DAY(RegisteredOn)";

        //echo $sql;

        $result = mysqli_query( $this->db, $sql);

        $data = array();
        while($row = mysqli_fetch_assoc($result))
        {
            $data[] = $row;
        }
        return $data;
    }

    function getInstallsByCountries($dataRequest){

        $filter = $this->generateSQLFromDataRequest($dataRequest, 'RegisteredOn');
        if ($filter != "")
            $filter = "WHERE $filter";

        //Find most popular 5 countries
        $sql = "SELECT
                    Country,
                    Count(Country) AS Occurance
                FROM
                    UserLogs
                $filter
                GROUP BY Country
                ORDER BY Occurance DESC
                LIMIT 5";
        $result = mysqli_query( $this->db, $sql);

        $sqlCountryCounter = "";
        $sqlOtherCountries = "SUM(CASE WHEN ";
        while($row = mysqli_fetch_assoc($result))
        {
            $country = $row["Country"];
            $sqlCountryCounter .= "SUM(CASE WHEN Country = '$country' THEN 1 ELSE 0 END) AS $country, ";
            $sqlOtherCountries .= "Country != '$country' AND ";
        }
        $sqlOtherCountries = substr($sqlOtherCountries, 0, strlen($sqlOtherCountries)-4)." THEN 1 ELSE 0 END) AS Others,";

        $sql = "SELECT
                    Date(RegisteredOn) AS RegOn,
                    $sqlCountryCounter
                    $sqlOtherCountries
                    Count(DeviceID) AS Total
                FROM UserLogs
                $filter
                GROUP BY DAY(RegisteredOn)";

        //echo $sql;

        $result = mysqli_query( $this->db, $sql);

        $data = array();
        while($row = mysqli_fetch_assoc($result))
        {
            $data[] = $row;
        }
        return $data;
    }

    //region SQL Generators
    function generateSQLFromDataRequest($dataRequest, $targetDateColumn){

        $sql = "";

        if (isset($dataRequest->dateStart)){
            $sql .= " AND UserLogs.$targetDateColumn >= '$dataRequest->dateStart'";
        }

        if (isset($dataRequest->dateEnd)){
            $sql .= " AND UserLogs.$targetDateColumn <= '$dataRequest->dateEnd'";
        }

        if (isset($dataRequest->filter)){
            $sql .= $this->generateSQLFromFilter($dataRequest->filter);
        }

        if ($sql != "")
            $sql = substr($sql, 4);

        return $sql;
    }

    function generateSQLFromFilter($filter){

        $sql = "";

        if (isset($filter->platformValue) && isset($filter->platformOperator)){
            $sql .= " AND UserLogs.Platform $filter->platformOperator $filter->platformValue";
        }

        if (isset($filter->countryValue) && isset($filter->countryOperator)){
            $sql .= " AND UserLogs.Country $filter->countryOperator '$filter->countryValue'";
        }

        if (isset($filter->referrerValue) && isset($filter->referrerOperator)){
            $sql .= " AND UserLogs.Referer $filter->referrerOperator '$filter->referrerValue'";
        }

        if (isset($filter->subReferrerValue) && isset($filter->subReferrerOperator)){
            $sql .= " AND UserLogs.RefererSub $filter->subReferrerOperator '$filter->subReferrerValue'";
        }

        if (isset($filter->userPaidValue) && isset($filter->userPaidOperator)){
            $sql .= " AND UserLogs.UserPaid $filter->userPaidOperator $filter->userPaidValue";
        }

        if (isset($filter->userProgressValue) && isset($filter->userProgressOperator)){
            $sql .= " AND UserLogs.Progress $filter->userProgressOperator $filter->userProgressValue";
        }

        return $sql;
    }
    //endregion
}

if (!isset($_GET["dataRequest"])){
    sendResponse(400, 'Invalid request');
    return false;
}
else {
    $api = new AnalyticsApi;
    $dataRequest = json_decode(urldecode($_GET["dataRequest"]));

    if (!isset($dataRequest->dataName)){
        sendResponse(400, 'Invalid request - Request is wrong!');
    }
    $data = array();
    switch ($dataRequest->dataName) {
        case "MostPopularCountries":
            $data = $api->getMostPopularCountries($dataRequest);
            break;
        case "InstallsByDays":
            $data = $api->getInstallsByDays($dataRequest);
            break;
        case "InstallsByPlatforms":
            $data = $api->getInstallsByPlatforms($dataRequest);
            break;
        case "InstallsByCountries":
            $data = $api->getInstallsByCountries($dataRequest);
            break;
        default:
            sendResponse(400, 'Invalid request - Chart not found');
    }
    sendResponse(200, json_encode($data));
}

// Helper method to get a string description for an HTTP status code
// From http://www.gen-x-design.com/archives/create-a-rest-api-with-php/
function getStatusCodeMessage($status)
{
    // these could be stored in a .ini file and loaded
    // via parse_ini_file()... however, this will suffice
    // for an example
    $codes = Array(
        100 => 'Continue',
        101 => 'Switching Protocols',
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative Information',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        306 => '(Unused)',
        307 => 'Temporary Redirect',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Timeout',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Long',
        415 => 'Unsupported Media Type',
        416 => 'Requested Range Not Satisfiable',
        417 => 'Expectation Failed',
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Timeout',
        505 => 'HTTP Version Not Supported'
    );

    return (isset($codes[$status])) ? $codes[$status] : '';
}

function strbool($value)
{
    return $value ? 'true' : 'false';
}

// Helper method to send a HTTP response code/message
function sendResponse($status = 200, $body = '', $content_type = 'text/html')
{
    $status_header = 'HTTP/1.1 ' . $status . ' ' . getStatusCodeMessage($status);
    header($status_header);
    header('Content-type: ' . $content_type);
    echo $body;
}