/**
 * FastAPI
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', process.cwd()+'/src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require(process.cwd()+'/src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.Triptracks);
  }
}(this, function(expect, Triptracks) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new Triptracks.Weather();
  });

  var getProperty = function(object, getter, property) {
    // Use getter method if present; otherwise, get the property directly.
    if (typeof object[getter] === 'function')
      return object[getter]();
    else
      return object[property];
  }

  var setProperty = function(object, setter, property, value) {
    // Use setter method if present; otherwise, set the property directly.
    if (typeof object[setter] === 'function')
      object[setter](value);
    else
      object[property] = value;
  }

  describe('Weather', function() {
    it('should create an instance of Weather', function() {
      // uncomment below and update the code to test Weather
      //var instance = new Triptracks.Weather();
      //expect(instance).to.be.a(Triptracks.Weather);
    });

    it('should have the property currentConditions (base name: "current_conditions")', function() {
      // uncomment below and update the code to test the property currentConditions
      //var instance = new Triptracks.Weather();
      //expect(instance).to.be();
    });

    it('should have the property dailyForecasts (base name: "daily_forecasts")', function() {
      // uncomment below and update the code to test the property dailyForecasts
      //var instance = new Triptracks.Weather();
      //expect(instance).to.be();
    });

    it('should have the property hourlyForecasts (base name: "hourly_forecasts")', function() {
      // uncomment below and update the code to test the property hourlyForecasts
      //var instance = new Triptracks.Weather();
      //expect(instance).to.be();
    });

    it('should have the property alerts (base name: "alerts")', function() {
      // uncomment below and update the code to test the property alerts
      //var instance = new Triptracks.Weather();
      //expect(instance).to.be();
    });

  });

}));
