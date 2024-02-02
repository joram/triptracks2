# Triptracks.DefaultApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createAccessKeyApiV0AccessKeyPost**](DefaultApi.md#createAccessKeyApiV0AccessKeyPost) | **POST** /api/v0/access_key | Create Access Key
[**createPackingListApiV0PackingListPost**](DefaultApi.md#createPackingListApiV0PackingListPost) | **POST** /api/v0/packing_list | Create Packing List
[**createTripPlanApiV0TripPlanPost**](DefaultApi.md#createTripPlanApiV0TripPlanPost) | **POST** /api/v0/trip_plan | Create Trip Plan
[**forecastApiV0ForecastGet**](DefaultApi.md#forecastApiV0ForecastGet) | **GET** /api/v0/forecast | Forecast
[**getPackingListApiV0PackingListPackingListIdGet**](DefaultApi.md#getPackingListApiV0PackingListPackingListIdGet) | **GET** /api/v0/packing_list/{packing_list_id} | Get Packing List
[**getPackingListsApiV0PackingListsGet**](DefaultApi.md#getPackingListsApiV0PackingListsGet) | **GET** /api/v0/packing_lists | Get Packing Lists
[**getTripPlanApiV0TripPlanTripPlanIdGet**](DefaultApi.md#getTripPlanApiV0TripPlanTripPlanIdGet) | **GET** /api/v0/trip_plan/{trip_plan_id} | Get Trip Plan
[**getTripPlansApiV0TripPlansGet**](DefaultApi.md#getTripPlansApiV0TripPlansGet) | **GET** /api/v0/trip_plans | Get Trip Plans
[**removePackingListApiV0PackingListPackingListIdDelete**](DefaultApi.md#removePackingListApiV0PackingListPackingListIdDelete) | **DELETE** /api/v0/packing_list/{packing_list_id} | Remove Packing List
[**removeTripPlanApiV0TripPlanTripPlanIdDelete**](DefaultApi.md#removeTripPlanApiV0TripPlanTripPlanIdDelete) | **DELETE** /api/v0/trip_plan/{trip_plan_id} | Remove Trip Plan
[**updatePackingListApiV0PackingListPackingListIdPost**](DefaultApi.md#updatePackingListApiV0PackingListPackingListIdPost) | **POST** /api/v0/packing_list/{packing_list_id} | Update Packing List
[**updateTripPlanApiV0TripPlanTripPlanIdPost**](DefaultApi.md#updateTripPlanApiV0TripPlanTripPlanIdPost) | **POST** /api/v0/trip_plan/{trip_plan_id} | Update Trip Plan
[**userinfoApiV0UserinfoGet**](DefaultApi.md#userinfoApiV0UserinfoGet) | **GET** /api/v0/userinfo | Userinfo



## createAccessKeyApiV0AccessKeyPost

> Object createAccessKeyApiV0AccessKeyPost(accessKeyRequest)

Create Access Key

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let accessKeyRequest = new Triptracks.AccessKeyRequest(); // AccessKeyRequest | 
apiInstance.createAccessKeyApiV0AccessKeyPost(accessKeyRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessKeyRequest** | [**AccessKeyRequest**](AccessKeyRequest.md)|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createPackingListApiV0PackingListPost

> Object createPackingListApiV0PackingListPost(accessKey)

Create Packing List

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let accessKey = "accessKey_example"; // String | 
apiInstance.createPackingListApiV0PackingListPost(accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createTripPlanApiV0TripPlanPost

> Object createTripPlanApiV0TripPlanPost(accessKey)

Create Trip Plan

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let accessKey = "accessKey_example"; // String | 
apiInstance.createTripPlanApiV0TripPlanPost(accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## forecastApiV0ForecastGet

> Forecast forecastApiV0ForecastGet(opts)

Forecast

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let opts = {
  'start': "'2022-2-10'", // String | 
  'end': "'2022-2-12'", // String | 
  'lat': 48.4284, // Number | 
  'lng': -123.3656 // Number | 
};
apiInstance.forecastApiV0ForecastGet(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **start** | **String**|  | [optional] [default to &#39;2022-2-10&#39;]
 **end** | **String**|  | [optional] [default to &#39;2022-2-12&#39;]
 **lat** | **Number**|  | [optional] [default to 48.4284]
 **lng** | **Number**|  | [optional] [default to -123.3656]

### Return type

[**Forecast**](Forecast.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPackingListApiV0PackingListPackingListIdGet

> Object getPackingListApiV0PackingListPackingListIdGet(packingListId)

Get Packing List

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let packingListId = "packingListId_example"; // String | 
apiInstance.getPackingListApiV0PackingListPackingListIdGet(packingListId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **packingListId** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPackingListsApiV0PackingListsGet

> Object getPackingListsApiV0PackingListsGet(accessKey)

Get Packing Lists

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let accessKey = "accessKey_example"; // String | 
apiInstance.getPackingListsApiV0PackingListsGet(accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTripPlanApiV0TripPlanTripPlanIdGet

> Object getTripPlanApiV0TripPlanTripPlanIdGet(tripPlanId, accessKey)

Get Trip Plan

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let tripPlanId = "tripPlanId_example"; // String | 
let accessKey = "accessKey_example"; // String | 
apiInstance.getTripPlanApiV0TripPlanTripPlanIdGet(tripPlanId, accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tripPlanId** | **String**|  | 
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTripPlansApiV0TripPlansGet

> Object getTripPlansApiV0TripPlansGet(accessKey)

Get Trip Plans

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let accessKey = "accessKey_example"; // String | 
apiInstance.getTripPlansApiV0TripPlansGet(accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## removePackingListApiV0PackingListPackingListIdDelete

> Object removePackingListApiV0PackingListPackingListIdDelete(packingListId, accessKey)

Remove Packing List

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let packingListId = "packingListId_example"; // String | 
let accessKey = "accessKey_example"; // String | 
apiInstance.removePackingListApiV0PackingListPackingListIdDelete(packingListId, accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **packingListId** | **String**|  | 
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## removeTripPlanApiV0TripPlanTripPlanIdDelete

> Object removeTripPlanApiV0TripPlanTripPlanIdDelete(tripPlanId, accessKey)

Remove Trip Plan

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let tripPlanId = "tripPlanId_example"; // String | 
let accessKey = "accessKey_example"; // String | 
apiInstance.removeTripPlanApiV0TripPlanTripPlanIdDelete(tripPlanId, accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tripPlanId** | **String**|  | 
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updatePackingListApiV0PackingListPackingListIdPost

> Object updatePackingListApiV0PackingListPackingListIdPost(packingListRequest, packingListId, accessKey)

Update Packing List

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let packingListRequest = new Triptracks.PackingListRequest(); // PackingListRequest | 
let packingListId = "packingListId_example"; // String | 
let accessKey = "accessKey_example"; // String | 
apiInstance.updatePackingListApiV0PackingListPackingListIdPost(packingListRequest, packingListId, accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **packingListRequest** | [**PackingListRequest**](PackingListRequest.md)|  | 
 **packingListId** | **String**|  | 
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateTripPlanApiV0TripPlanTripPlanIdPost

> Object updateTripPlanApiV0TripPlanTripPlanIdPost(tripPlanRequest, tripPlanId, accessKey)

Update Trip Plan

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let tripPlanRequest = new Triptracks.TripPlanRequest(); // TripPlanRequest | 
let tripPlanId = "tripPlanId_example"; // String | 
let accessKey = "accessKey_example"; // String | 
apiInstance.updateTripPlanApiV0TripPlanTripPlanIdPost(tripPlanRequest, tripPlanId, accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tripPlanRequest** | [**TripPlanRequest**](TripPlanRequest.md)|  | 
 **tripPlanId** | **String**|  | 
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## userinfoApiV0UserinfoGet

> Object userinfoApiV0UserinfoGet(accessKey)

Userinfo

### Example

```javascript
import Triptracks from 'triptracks';

let apiInstance = new Triptracks.DefaultApi();
let accessKey = "accessKey_example"; // String | 
apiInstance.userinfoApiV0UserinfoGet(accessKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessKey** | **String**|  | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

