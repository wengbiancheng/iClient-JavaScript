﻿require('../../../src/Core/iServer/OverlayAnalystService');

var serviceFailedEventArgsSystem = null;
var analystEventArgsSystem = null;
var spatialAnalystURL = "http://localhost:8090/iserver/services/spatialanalyst-sample/restjsr/spatialanalyst";
var options =  {
    eventListeners: {
        'processFailed':OverlayAnalystServiceFailed,
        'processCompleted':OverlayAnalystServiceCompleted
    }
};
function initOverlayAnalystService_Register() {
    return new SuperMap.REST.OverlayAnalystService(spatialAnalystURL, options);
}
function OverlayAnalystServiceCompleted(eventArgs){
    analystEventArgsSystem = eventArgs;
}
function OverlayAnalystServiceFailed(eventArgs){
    serviceFailedEventArgsSystem = eventArgs;
}


describe('testOverlayAnalystService_processAsync',function(){
    var originalTimeout;
    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
        serviceFailedEventArgsSystem = null;
        analystEventArgsSystem = null;
    });
    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    //不直接返回查询结果
    it('AnalyzeByDatasets_NotReturnContent',function(done){
        var overlayServiceByDatasets = initOverlayAnalystService_Register();
        expect(overlayServiceByDatasets).not.toBeNull();
        expect(overlayServiceByDatasets.url).toEqual(spatialAnalystURL);
        var dsOverlayAnalystParameters = new DatasetOverlayAnalystParameters();
        dsOverlayAnalystParameters.sourceDataset = "Landuse_R@Jingjin";
        dsOverlayAnalystParameters.operateDataset = "Lake_R@Jingjin";
        dsOverlayAnalystParameters.operation = OverlayOperationType.UPDATE;
        overlayServiceByDatasets.processAsync(dsOverlayAnalystParameters);
        overlayServiceByDatasets.events.on({"processCompleted":OverlayAnalystServiceCompleted});

        setTimeout(function(){
            try{
                var overlayResult = analystEventArgsSystem.result;
                expect(overlayResult).not.toBeNull();
                overlayServiceByDatasets.destroy();
                expect(overlayServiceByDatasets.EVENT_TYPES).toBeNull();
                expect(overlayServiceByDatasets.eventListeners).toBeNull();
                expect(overlayServiceByDatasets.events).toBeNull();
                dsOverlayAnalystParameters.destroy();
                done();
            }catch(excepion){
                expect(false).toBeTruthy();
                console.log("FieldStatisticService_" + exception.name + ":" + exception.message);
                overlayServiceByDatasets.destroy();
                dsOverlayAnalystParameters.destroy();
                done();
            }
        },6000)
    });

    it('AnalyzeByDatasets_failed', function (done){
        var overlayServiceByDatasets = initOverlayAnalystService_Register();
        expect(overlayServiceByDatasets).not.toBeNull();
        var dsOverlayAnalystParameters = new DatasetOverlayAnalystParameters();
        dsOverlayAnalystParameters.sourceDataset = "Landu@Jingjin";
        dsOverlayAnalystParameters.operateDataset = "Lake_R@Jingjin";
        dsOverlayAnalystParameters.operation = OverlayOperationType.UPDATE;
        overlayServiceByDatasets.processAsync(dsOverlayAnalystParameters);
        overlayServiceByDatasets.events.on({"processFailed":OverlayAnalystServiceFailed});

        setTimeout(function(){
            try{
                expect(serviceFailedEventArgsSystem.error.errorMsg).not.toBeNull();
                expect(serviceFailedEventArgsSystem.error.code).toEqual(400);
                overlayServiceByDatasets.destroy();
                dsOverlayAnalystParameters.destroy();
                done();
            }catch(excepion){
                expect(false).toBeTruthy();
                console.log("FieldStatisticService_" + exception.name + ":" + exception.message);
                overlayServiceByDatasets.destroy();
                dsOverlayAnalystParameters.destroy();
                done();
            }
        },6000)
    });

    it('AnalyzeByDatasets_Geometry', function (done){
        var overlayServiceByDatasets = initOverlayAnalystService_Register();
        expect(overlayServiceByDatasets).not.toBeNull();
        var points = [new SuperMap.Geometry.Point(47.9909960608, 382.4873382105),
            new SuperMap.Geometry.Point(47.9909960608, 437.8615644344),
            new SuperMap.Geometry.Point(170.3545301069, 437.8615644344),
            new SuperMap.Geometry.Point(170.3545301069, 382.4873382105)];
        var sourceGeometry = new SuperMap.Geometry.LineString(points);

        var points1 = [new SuperMap.Geometry.Point(111.4687675858, 353.8548114800),
            new SuperMap.Geometry.Point(111.4687675858, 408.1485649972),
            new SuperMap.Geometry.Point(208.9814293754, 408.1485649972),
            new SuperMap.Geometry.Point(208.9814293754, 353.8548114800)];
        var operateGeometry = new SuperMap.Geometry.Polygon(new SuperMap.Geometry.LinearRing(points1));
        var geOverlayAnalystParameters = new GeometryOverlayAnalystParameters();
        geOverlayAnalystParameters.sourceGeometry = sourceGeometry;
        geOverlayAnalystParameters.operateGeometry = operateGeometry;
        geOverlayAnalystParameters.operation = OverlayOperationType.CLIP;
        overlayServiceByDatasets.processAsync(geOverlayAnalystParameters);
        overlayServiceByDatasets.events.on({"processCompleted":OverlayAnalystServiceCompleted});

        setTimeout(function(){
            try{
                var overlayResult = analystEventArgsSystem.result;
                expect(overlayResult).not.toBeNull();
                overlayServiceByDatasets.destroy();
                geOverlayAnalystParameters.destroy();
                done();
            }catch(excepion){
                expect(false).toBeTruthy();
                console.log("FieldStatisticService_" + exception.name + ":" + exception.message);
                overlayServiceByDatasets.destroy();
                geOverlayAnalystParameters.destroy();
                done();
            }
        },6000)
    });
});