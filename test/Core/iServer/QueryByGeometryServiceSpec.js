﻿require('../../../src/Core/iServer/QueryByGeometryService');

var serviceFailedEventArgsSystem = null;
var serviceCompletedEventArgsSystem = null;
var worldMapURL = "http://localhost:8090/iserver/services/map-world/rest/maps/World Map";

//跨域下的测试
function initQueryByGeometryService() {
    return new SuperMap.REST.QueryByGeometryService(worldMapURL);
}
var options = {
    eventListeners: {
        'processFailed':QueryByGeometryServiceFailed,
        'processCompleted':QueryByGeometryServiceCompleted
    }
};
//服务初始化时注册事件监听函数
function initQueryByGeometryService_RegisterListener() {
    return new SuperMap.REST.QueryByGeometryService(worldMapURL, options);
}
function QueryByGeometryServiceFailed(serviceFailedEventArgs){
    serviceFailedEventArgsSystem=serviceFailedEventArgs;
}
function QueryByGeometryServiceCompleted(serviceCompletedEventArgs){
    serviceCompletedEventArgsSystem=serviceCompletedEventArgs;
}

describe('testQueryByGeometryService_constructor',function(){
    it('constructor and destroy',function(){
        var queryByGeometryService = initQueryByGeometryService();
        expect(queryByGeometryService).not.toBeNull();
        expect(queryByGeometryService.url).toEqual(worldMapURL+ "/queryResults.jsonp?");
        queryByGeometryService.destroy();
        expect(queryByGeometryService.EVENT_TYPES).toBeNull();
        expect(queryByGeometryService.events).toBeNull();
        expect(queryByGeometryService.returnContent).toBeNull();
    })
});

describe('testQueryByGeometryService_processAsync',function(){
    var originalTimeout;
    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
        serviceFailedEventArgsSystem = null;
        serviceCompletedEventArgsSystem = null;
    });
    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('pass',function(done){
        var queryByGeometryService = initQueryByGeometryService_RegisterListener();
        var points = new Array(new SuperMap.Geometry.Point(-90,-45),
            new SuperMap.Geometry.Point(90,-45),
            new SuperMap.Geometry.Point(90,45),
            new SuperMap.Geometry.Point(-90,45),
            new SuperMap.Geometry.Point(-90,-45));
        var geometry = new SuperMap.Geometry.Polygon(new SuperMap.Geometry.LinearRing(points));
        var queryByGeometryParameters = new QueryByGeometryParameters({
            customParams:null,
            expectCount:3,
            startRecord:1,
            networkType:GeometryType.POINT,
            queryOption:QueryOption.ATTRIBUTEANDGEOMETRY,
            spatialQueryMode:SpatialQueryMode.INTERSECT,
            queryParams:new Array(new FilterParameter({
                attributeFilter:"SmID<20",
                name:"Capitals@World"
            })),
            returnContent:false,
            geometry:geometry
        });
        queryByGeometryParameters.startRecord=0;
        queryByGeometryParameters.holdTime=10;
        queryByGeometryService.processAsync(queryByGeometryParameters);

        setTimeout(function() {
            try{
                var queryResult = serviceCompletedEventArgsSystem.result;
                expect(queryResult).not.toBeNull();
                expect(queryResult.succeed).toBeTruthy();
                expect(queryResult.newResourceLocation).not.toBeNull();
                expect(queryResult.newResourceLocation.length).toBeGreaterThan(0);
                expect(queryResult.newResourceID).not.toBeNull();
                queryByGeometryService.destroy();
                queryByGeometryParameters.destroy();
                done();
            }catch(excepion){
                expect(false).toBeTruthy();
                console.log("FieldStatisticService_" + exception.name + ":" + exception.message);
                queryByGeometryService.destroy();
                queryByGeometryParameters.destroy();
                done();
            }
        },6000);
    });

    it('returnContent',function(done){
        var queryByGeometryService = initQueryByGeometryService_RegisterListener();
        var points = new Array(
            new SuperMap.Geometry.Point(-90,-45),
            new SuperMap.Geometry.Point(90,-45),
            new SuperMap.Geometry.Point(90,45),
            new SuperMap.Geometry.Point(-90,45),
            new SuperMap.Geometry.Point(-90,-45)
        );
        var geometry = new SuperMap.Geometry.Polygon(new SuperMap.Geometry.LinearRing(points));
        var queryByGeometryParameters = new QueryByGeometryParameters({
            customParams:null,
            expectCount:10,
            startRecord:1,
            networkType:GeometryType.POINT,
            queryOption:QueryOption.ATTRIBUTEANDGEOMETRY,
            spatialQueryMode:SpatialQueryMode.INTERSECT,
            queryParams:new Array(new FilterParameter({
                attributeFilter:"SmID<20",
                name:"Capitals@World",
            })),
            returnContent:true,
            geometry:geometry
        });
        queryByGeometryParameters.startRecord=0;
        queryByGeometryParameters.holdTime=10;
        queryByGeometryService.processAsync(queryByGeometryParameters);

        setTimeout(function() {
            try{
                var queryResult = serviceCompletedEventArgsSystem.result;
                expect(queryResult).not.toBeNull();
                expect(serviceCompletedEventArgsSystem.result[0].type).toBe("FeatureCollection");
                expect(serviceCompletedEventArgsSystem.result[0].features.length).toEqual(10);
                queryByGeometryService.destroy();
                queryByGeometryParameters.destroy();
                done();
            }catch(excepion){
                expect(false).toBeTruthy();
                console.log("FieldStatisticService_" + exception.name + ":" + exception.message);
                queryByGeometryService.destroy();
                queryByGeometryParameters.destroy();
                done();
            }
        },6000);
    });

    //查询参数为空
    it('fail',function(done){
        var queryByGeometryService = initQueryByGeometryService_RegisterListener();
        var queryByGeometryParameters = new QueryByGeometryParameters({
            customParams:null,
            expectCount:100,
            networkType:GeometryType.POINT,
            queryOption:QueryOption.ATTRIBUTE,
            spatialQueryMode:SpatialQueryMode.OVERLAP,
            queryParams:new Array(),
            geometry:new SuperMap.Geometry.Point(-50,-20)
        });
        queryByGeometryParameters.startRecord=0;
        queryByGeometryParameters.holdTime=10;
        queryByGeometryService.events.on({'processFailed': queryFailed});
        queryByGeometryService.processAsync(queryByGeometryParameters);

        function queryFailed(e){
            failedResult = e;
        }

        setTimeout(function() {
            try{
                expect(serviceFailedEventArgsSystem).not.toBeNull();
                expect(serviceFailedEventArgsSystem.error).not.toBeNull();
                expect(serviceFailedEventArgsSystem.error.code).toEqual(400);
                expect(serviceFailedEventArgsSystem.error.errorMsg).not.toBeNull();
                queryByGeometryService.destroy();
                queryByGeometryParameters.destroy();
                done();
            }catch(excepion){
                expect(false).toBeTruthy();
                console.log("FieldStatisticService_" + exception.name + ":" + exception.message);
                queryByGeometryService.destroy();
                queryByGeometryParameters.destroy();
                done();
            }
        },6000);
    })
});


