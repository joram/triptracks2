import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Schemas {
        /**
         * AccessKeyRequest
         */
        export interface AccessKeyRequest {
            /**
             * Token
             */
            token: string;
        }
        /**
         * Alerts
         */
        export interface Alerts {
            advisories: /* ListOfStrings */ ListOfStrings;
            endings: /* ListOfStrings */ ListOfStrings;
            statements: /* ListOfStrings */ ListOfStrings;
            warnings: /* ListOfStrings */ ListOfStrings;
            watches: /* ListOfStrings */ ListOfStrings;
        }
        /**
         * Avalanche
         */
        export interface Avalanche {
            /**
             * Title
             */
            title: string;
            /**
             * Date Issued
             */
            date_issued: string;
            /**
             * Valid Until
             */
            valid_until: string;
            /**
             * Forecaster
             */
            forecaster: string;
            /**
             * Summary
             */
            summary: string;
            /**
             * Layers
             */
            layers: /* AvalancheForecastLayer */ AvalancheForecastLayer[];
            /**
             * Confidence
             */
            confidence: string;
            /**
             * Advice
             */
            advice: string[];
        }
        /**
         * AvalancheForecastLayer
         */
        export interface AvalancheForecastLayer {
            /**
             * Date
             */
            date: string;
            /**
             * Alpine Rating
             */
            alpine_rating: string;
            /**
             * Treeline Rating
             */
            treeline_rating: string;
            /**
             * Below Treeline Rating
             */
            below_treeline_rating: string;
        }
        /**
         * CurrentConditions
         */
        export interface CurrentConditions {
            temperature: /* Value */ Value;
            dewpoint: /* Value */ Value;
            wind_chill: /* UnitlessValue */ UnitlessValue;
            humidex: /* UnitlessValue */ UnitlessValue;
            pressure: /* Value */ Value;
            tendency: /* UnitlessStringValue */ UnitlessStringValue;
            humidity: /* Value */ Value;
            visibility: /* Value */ Value;
            condition: /* UnitlessStringValue */ UnitlessStringValue;
            wind_speed: /* Value */ Value;
            wind_gust: /* UnitlessValue */ UnitlessValue;
            wind_dir: /* UnitlessStringValue */ UnitlessStringValue;
            wind_bearing: /* Value */ Value;
            high_temp: /* Value */ Value;
            low_temp: /* Value */ Value;
            uv_index: /* UnitlessValue */ UnitlessValue;
            pop: /* UnitlessValue */ UnitlessValue;
            icon_code: /* UnitlessValue */ UnitlessValue;
            precip_yesterday: /* Value */ Value;
            normal_high: /* Value */ Value;
            normal_low: /* Value */ Value;
            text_summary: /* UnitlessStringValue */ UnitlessStringValue;
        }
        /**
         * DailyForecast
         */
        export interface DailyForecast {
            /**
             * Icon Code
             */
            icon_code: string;
            /**
             * Period
             */
            period: string;
            /**
             * Precip Probability
             */
            precip_probability: number;
            /**
             * Temperature
             */
            temperature: number;
            /**
             * Temperature Class
             */
            temperature_class: string;
            /**
             * Text Summary
             */
            text_summary: string;
        }
        /**
         * Forecast
         */
        export interface Forecast {
            avalanche: /* Avalanche */ Avalanche;
            weather: /* Weather */ Weather;
        }
        /**
         * HTTPValidationError
         */
        export interface HTTPValidationError {
            /**
             * Detail
             */
            detail?: /* ValidationError */ ValidationError[];
        }
        /**
         * HourlyForecast
         */
        export interface HourlyForecast {
            /**
             * Condition
             */
            condition: string;
            /**
             * Icon Code
             */
            icon_code: string;
            /**
             * Period
             */
            period: string; // date-time
            /**
             * Precip Probability
             */
            precip_probability: number;
            /**
             * Temperature
             */
            temperature: number;
        }
        /**
         * ListOfStrings
         */
        export interface ListOfStrings {
            /**
             * Value
             */
            value: string[];
            /**
             * Label
             */
            label: string;
        }
        /**
         * PackingListRequest
         */
        export interface PackingListRequest {
            /**
             * Name
             */
            name: string;
            /**
             * Contents
             */
            contents: {
                [key: string]: any;
            }[];
        }
        /**
         * TripPlanDate
         */
        export interface TripPlanDate {
            /**
             * Type
             */
            type: string;
            /**
             * Dates
             */
            dates: /* Dates */ string | string[];
        }
        /**
         * TripPlanRequest
         */
        export interface TripPlanRequest {
            /**
             * Name
             */
            name: string;
            dates?: /* TripPlanDate */ TripPlanDate;
        }
        /**
         * UnitlessStringValue
         */
        export interface UnitlessStringValue {
            /**
             * Value
             */
            value?: string;
            /**
             * Label
             */
            label: string;
        }
        /**
         * UnitlessValue
         */
        export interface UnitlessValue {
            /**
             * Value
             */
            value?: number;
            /**
             * Label
             */
            label: string;
        }
        /**
         * ValidationError
         */
        export interface ValidationError {
            /**
             * Location
             */
            loc: (string | number)[];
            /**
             * Message
             */
            msg: string;
            /**
             * Error Type
             */
            type: string;
        }
        /**
         * Value
         */
        export interface Value {
            /**
             * Value
             */
            value?: number;
            /**
             * Unit
             */
            unit: string;
            /**
             * Label
             */
            label: string;
        }
        /**
         * Weather
         */
        export interface Weather {
            current_conditions: /* CurrentConditions */ CurrentConditions;
            /**
             * Daily Forecasts
             */
            daily_forecasts: /* DailyForecast */ DailyForecast[];
            /**
             * Hourly Forecasts
             */
            hourly_forecasts: /* HourlyForecast */ HourlyForecast[];
            alerts: /* Alerts */ Alerts;
        }
    }
}
declare namespace Paths {
    namespace CreateAccessKeyApiV0AccessKeyPost {
        export type RequestBody = /* AccessKeyRequest */ Components.Schemas.AccessKeyRequest;
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace CreatePackingListApiV0PackingListPost {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace CreateTripPlanApiV0TripPlanPost {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace ForecastApiV0ForecastGet {
        namespace Parameters {
            /**
             * End
             */
            export type End = string;
            /**
             * Lat
             */
            export type Lat = number;
            /**
             * Lng
             */
            export type Lng = number;
            /**
             * Start
             */
            export type Start = string;
        }
        export interface QueryParameters {
            start?: /* Start */ Parameters.Start;
            end?: /* End */ Parameters.End;
            lat?: /* Lat */ Parameters.Lat;
            lng?: /* Lng */ Parameters.Lng;
        }
        namespace Responses {
            export type $200 = /* Forecast */ Components.Schemas.Forecast;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace GetPackingListApiV0PackingListPackingListIdGet {
        namespace Parameters {
            /**
             * Packing List Id
             */
            export type PackingListId = string;
        }
        export interface PathParameters {
            packing_list_id: /* Packing List Id */ Parameters.PackingListId;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace GetPackingListsApiV0PackingListsGet {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace GetTripPlanApiV0TripPlanTripPlanIdGet {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
            /**
             * Trip Plan Id
             */
            export type TripPlanId = string;
        }
        export interface PathParameters {
            trip_plan_id: /* Trip Plan Id */ Parameters.TripPlanId;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace GetTripPlansApiV0TripPlansGet {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace RemovePackingListApiV0PackingListPackingListIdDelete {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
            /**
             * Packing List Id
             */
            export type PackingListId = string;
        }
        export interface PathParameters {
            packing_list_id: /* Packing List Id */ Parameters.PackingListId;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace RemoveTripPlanApiV0TripPlanTripPlanIdDelete {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
            /**
             * Trip Plan Id
             */
            export type TripPlanId = string;
        }
        export interface PathParameters {
            trip_plan_id: /* Trip Plan Id */ Parameters.TripPlanId;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace UpdatePackingListApiV0PackingListPackingListIdPost {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
            /**
             * Packing List Id
             */
            export type PackingListId = string;
        }
        export interface PathParameters {
            packing_list_id: /* Packing List Id */ Parameters.PackingListId;
        }
        export type RequestBody = /* PackingListRequest */ Components.Schemas.PackingListRequest;
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace UpdateTripPlanApiV0TripPlanTripPlanIdPatch {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
            /**
             * Trip Plan Id
             */
            export type TripPlanId = string;
        }
        export interface PathParameters {
            trip_plan_id: /* Trip Plan Id */ Parameters.TripPlanId;
        }
        export type RequestBody = /* TripPlanRequest */ Components.Schemas.TripPlanRequest;
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
    namespace UserinfoApiV0UserinfoGet {
        export interface HeaderParameters {
            "access-key": /* Access-Key */ Parameters.AccessKey;
        }
        namespace Parameters {
            /**
             * Access-Key
             */
            export type AccessKey = string;
        }
        namespace Responses {
            export type $200 = any;
            export type $422 = /* HTTPValidationError */ Components.Schemas.HTTPValidationError;
        }
    }
}

export interface OperationMethods {
  /**
   * create_access_key_api_v0_access_key_post - Create Access Key
   */
  'create_access_key_api_v0_access_key_post'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateAccessKeyApiV0AccessKeyPost.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateAccessKeyApiV0AccessKeyPost.Responses.$200>
  /**
   * userinfo_api_v0_userinfo_get - Userinfo
   */
  'userinfo_api_v0_userinfo_get'(
    parameters?: Parameters<Paths.UserinfoApiV0UserinfoGet.HeaderParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UserinfoApiV0UserinfoGet.Responses.$200>
  /**
   * get_packing_lists_api_v0_packing_lists_get - Get Packing Lists
   */
  'get_packing_lists_api_v0_packing_lists_get'(
    parameters?: Parameters<Paths.GetPackingListsApiV0PackingListsGet.HeaderParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPackingListsApiV0PackingListsGet.Responses.$200>
  /**
   * get_packing_list_api_v0_packing_list__packing_list_id__get - Get Packing List
   */
  'get_packing_list_api_v0_packing_list__packing_list_id__get'(
    parameters?: Parameters<Paths.GetPackingListApiV0PackingListPackingListIdGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPackingListApiV0PackingListPackingListIdGet.Responses.$200>
  /**
   * update_packing_list_api_v0_packing_list__packing_list_id__post - Update Packing List
   */
  'update_packing_list_api_v0_packing_list__packing_list_id__post'(
    parameters?: Parameters<Paths.UpdatePackingListApiV0PackingListPackingListIdPost.HeaderParameters & Paths.UpdatePackingListApiV0PackingListPackingListIdPost.PathParameters> | null,
    data?: Paths.UpdatePackingListApiV0PackingListPackingListIdPost.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdatePackingListApiV0PackingListPackingListIdPost.Responses.$200>
  /**
   * remove_packing_list_api_v0_packing_list__packing_list_id__delete - Remove Packing List
   */
  'remove_packing_list_api_v0_packing_list__packing_list_id__delete'(
    parameters?: Parameters<Paths.RemovePackingListApiV0PackingListPackingListIdDelete.HeaderParameters & Paths.RemovePackingListApiV0PackingListPackingListIdDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemovePackingListApiV0PackingListPackingListIdDelete.Responses.$200>
  /**
   * create_packing_list_api_v0_packing_list_post - Create Packing List
   */
  'create_packing_list_api_v0_packing_list_post'(
    parameters?: Parameters<Paths.CreatePackingListApiV0PackingListPost.HeaderParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreatePackingListApiV0PackingListPost.Responses.$200>
  /**
   * get_trip_plans_api_v0_trip_plans_get - Get Trip Plans
   */
  'get_trip_plans_api_v0_trip_plans_get'(
    parameters?: Parameters<Paths.GetTripPlansApiV0TripPlansGet.HeaderParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTripPlansApiV0TripPlansGet.Responses.$200>
  /**
   * get_trip_plan_api_v0_trip_plan__trip_plan_id__get - Get Trip Plan
   */
  'get_trip_plan_api_v0_trip_plan__trip_plan_id__get'(
    parameters?: Parameters<Paths.GetTripPlanApiV0TripPlanTripPlanIdGet.HeaderParameters & Paths.GetTripPlanApiV0TripPlanTripPlanIdGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTripPlanApiV0TripPlanTripPlanIdGet.Responses.$200>
  /**
   * update_trip_plan_api_v0_trip_plan__trip_plan_id__patch - Update Trip Plan
   */
  'update_trip_plan_api_v0_trip_plan__trip_plan_id__patch'(
    parameters?: Parameters<Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.HeaderParameters & Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.PathParameters> | null,
    data?: Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.Responses.$200>
  /**
   * remove_trip_plan_api_v0_trip_plan__trip_plan_id__delete - Remove Trip Plan
   */
  'remove_trip_plan_api_v0_trip_plan__trip_plan_id__delete'(
    parameters?: Parameters<Paths.RemoveTripPlanApiV0TripPlanTripPlanIdDelete.HeaderParameters & Paths.RemoveTripPlanApiV0TripPlanTripPlanIdDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveTripPlanApiV0TripPlanTripPlanIdDelete.Responses.$200>
  /**
   * create_trip_plan_api_v0_trip_plan_post - Create Trip Plan
   */
  'create_trip_plan_api_v0_trip_plan_post'(
    parameters?: Parameters<Paths.CreateTripPlanApiV0TripPlanPost.HeaderParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateTripPlanApiV0TripPlanPost.Responses.$200>
  /**
   * forecast_api_v0_forecast_get - Forecast
   */
  'forecast_api_v0_forecast_get'(
    parameters?: Parameters<Paths.ForecastApiV0ForecastGet.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ForecastApiV0ForecastGet.Responses.$200>
}

export interface PathsDictionary {
  ['/api/v0/access_key']: {
    /**
     * create_access_key_api_v0_access_key_post - Create Access Key
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateAccessKeyApiV0AccessKeyPost.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateAccessKeyApiV0AccessKeyPost.Responses.$200>
  }
  ['/api/v0/userinfo']: {
    /**
     * userinfo_api_v0_userinfo_get - Userinfo
     */
    'get'(
      parameters?: Parameters<Paths.UserinfoApiV0UserinfoGet.HeaderParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UserinfoApiV0UserinfoGet.Responses.$200>
  }
  ['/api/v0/packing_lists']: {
    /**
     * get_packing_lists_api_v0_packing_lists_get - Get Packing Lists
     */
    'get'(
      parameters?: Parameters<Paths.GetPackingListsApiV0PackingListsGet.HeaderParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPackingListsApiV0PackingListsGet.Responses.$200>
  }
  ['/api/v0/packing_list/{packing_list_id}']: {
    /**
     * get_packing_list_api_v0_packing_list__packing_list_id__get - Get Packing List
     */
    'get'(
      parameters?: Parameters<Paths.GetPackingListApiV0PackingListPackingListIdGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPackingListApiV0PackingListPackingListIdGet.Responses.$200>
    /**
     * update_packing_list_api_v0_packing_list__packing_list_id__post - Update Packing List
     */
    'post'(
      parameters?: Parameters<Paths.UpdatePackingListApiV0PackingListPackingListIdPost.HeaderParameters & Paths.UpdatePackingListApiV0PackingListPackingListIdPost.PathParameters> | null,
      data?: Paths.UpdatePackingListApiV0PackingListPackingListIdPost.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdatePackingListApiV0PackingListPackingListIdPost.Responses.$200>
    /**
     * remove_packing_list_api_v0_packing_list__packing_list_id__delete - Remove Packing List
     */
    'delete'(
      parameters?: Parameters<Paths.RemovePackingListApiV0PackingListPackingListIdDelete.HeaderParameters & Paths.RemovePackingListApiV0PackingListPackingListIdDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemovePackingListApiV0PackingListPackingListIdDelete.Responses.$200>
  }
  ['/api/v0/packing_list']: {
    /**
     * create_packing_list_api_v0_packing_list_post - Create Packing List
     */
    'post'(
      parameters?: Parameters<Paths.CreatePackingListApiV0PackingListPost.HeaderParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreatePackingListApiV0PackingListPost.Responses.$200>
  }
  ['/api/v0/trip_plans']: {
    /**
     * get_trip_plans_api_v0_trip_plans_get - Get Trip Plans
     */
    'get'(
      parameters?: Parameters<Paths.GetTripPlansApiV0TripPlansGet.HeaderParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTripPlansApiV0TripPlansGet.Responses.$200>
  }
  ['/api/v0/trip_plan/{trip_plan_id}']: {
    /**
     * get_trip_plan_api_v0_trip_plan__trip_plan_id__get - Get Trip Plan
     */
    'get'(
      parameters?: Parameters<Paths.GetTripPlanApiV0TripPlanTripPlanIdGet.HeaderParameters & Paths.GetTripPlanApiV0TripPlanTripPlanIdGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTripPlanApiV0TripPlanTripPlanIdGet.Responses.$200>
    /**
     * remove_trip_plan_api_v0_trip_plan__trip_plan_id__delete - Remove Trip Plan
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveTripPlanApiV0TripPlanTripPlanIdDelete.HeaderParameters & Paths.RemoveTripPlanApiV0TripPlanTripPlanIdDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveTripPlanApiV0TripPlanTripPlanIdDelete.Responses.$200>
    /**
     * update_trip_plan_api_v0_trip_plan__trip_plan_id__patch - Update Trip Plan
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.HeaderParameters & Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.PathParameters> | null,
      data?: Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateTripPlanApiV0TripPlanTripPlanIdPatch.Responses.$200>
  }
  ['/api/v0/trip_plan']: {
    /**
     * create_trip_plan_api_v0_trip_plan_post - Create Trip Plan
     */
    'post'(
      parameters?: Parameters<Paths.CreateTripPlanApiV0TripPlanPost.HeaderParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateTripPlanApiV0TripPlanPost.Responses.$200>
  }
  ['/api/v0/forecast']: {
    /**
     * forecast_api_v0_forecast_get - Forecast
     */
    'get'(
      parameters?: Parameters<Paths.ForecastApiV0ForecastGet.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ForecastApiV0ForecastGet.Responses.$200>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
