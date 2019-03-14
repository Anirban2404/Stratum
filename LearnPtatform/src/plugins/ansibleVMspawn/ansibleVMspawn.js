/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Fri Jun 09 2017 14:20:55 GMT-0500 (CDT).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'cloudcamp/openstackVMspawn',
    'cloudcamp/webgenerateAnsible',
    'cloudcamp/dbgenerateAnsible',
    'cloudcamp/dataanalyticsgenerateAnsible'
], function (PluginConfig,
             pluginMetadata,
             PluginBase,
             openstackVMspawn,
             webAnsible,
             dbAnsible,
             analyticsAnsible) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of ansibleVMspawn.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ansibleVMspawn.
     * @constructor
     */
    var ansibleVMspawn = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
        this.pathToNode = {};
    };
    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    ansibleVMspawn.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    ansibleVMspawn.prototype = Object.create(PluginBase.prototype);
    ansibleVMspawn.prototype.constructor = ansibleVMspawn;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    ansibleVMspawn.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;

        // Using the coreAPI to make changes.

        nodeObject = self.activeNode;
        self.extractDataModel()
            .then(function (dataModel) {
                var dataModelStr = JSON.stringify(dataModel, null, 4);
                self.dataModel = dataModel;
                //self.logger.info('Extracted dataModel', dataModelStr);
            })
            .catch(function (err) {
                // Success is false at invocation.
                callback(err, self.result);
            });
    };

    /**
     *
     * @param {function(Error, object)} [callback] - If not defined promise a will be returned.
     */

    ansibleVMspawn.prototype.extractDataModel = function (callback) {
        var self = this;
        var Q = require("q");
        //self.pathToNode={};
        var wvisited = false;
        var dvisited = false;
        //self.logger.info (self.core.getAttribute(self.activeNode, 'name'));

        // var dataModel =
        //     {
        //         ansibleModel: {
        //             AppType: "",
        //             VMName: "",
        //             cpu_num: "",
        //             disk_size: "",
        //             flavor_name: "",
        //             hostname: "",
        //             image: "",
        //             mem_size: "",
        //             network: ""
        //         }
        //     };
        var dataModel =
            {
                ansibleModel: {
                    VMName: "",
                    flavor_name: "",
                    hostname: "",
                    image: "",
                    network: "",
                    imageName: "",
                    keyName: "",
                    OS: {
                        name: "",
                        version: ""
                    }
                }
            };

        var webModel =
            {
                WebApplicationModel: {
                    AppType: "",
                    AppName: "",
                    host_ip: "",
                    srcPath: "",
                    language: "",
                    WebEngine: "",
                    OS: {
                        name: "",
                        version: ""
                    }
                }
            };


        var dbModel =
            {
                DBApplicationModel: {
                    AppType: "",
                    AppName: "",
                    host_ip: "",
                    srcPath: "",
                    password: "",
                    port: "",
                    replication_count: "",
                    user: "",
                    dbEngine: "",
                    dbnames: "",
                    dbLocation: "",
                    OS: {
                        name: "",
                        version: ""
                    }
                }
            };

        var analyticsModel =
            {
                dataAnalyticsModel: {
                    AppType: "",
                    AppName: "",
                    host_ip: "",
                    srcPath: "",
                    replication_count: "",
                    analyticsEngine: [],
                    platformVersion: "",
                    jupyter: "",
                    OS: {
                        name: "",
                        version: ""
                    }

                }
            };

        // In order to avoid multiple iterative asynchronous 'load' calls we pre-load all the nodes in the state-machine
        // and builds up a local hash-map from their paths to the node.
        return this.core.loadSubTree(self.activeNode)
            .then(function (nodes) {

                // All the nodes or objects
                for (var i = 0; i < nodes.length; i += 1) {
                    self.pathToNode[self.core.getPath(nodes[i])] = nodes[i];
                    //self.logger.info(self.core.getAttribute(nodes[i], 'name'));
                }
                var HashMap = require('hashmap');
                var map = new HashMap();
                var dstNodes = [];
                var srcNodes = [];
                var dbdependendency = false;
                var webdependent = false;
                var jupyterdependendency = false;
                var childrenPaths = self.core.getChildrenPaths(self.activeNode);
                // console.log(childrenPaths.length);
                for (i = 0; i < childrenPaths.length; i += 1) {

                    var childNode = self.pathToNode[childrenPaths[i]];

                    if (self.isMetaTypeOf(childNode, self.META['ConnectsTo']) === true) {
                        childName = self.core.getAttribute(childNode, 'name');
                        self.logger.info('At childNode', childName);
                        var src_Path = self.core.getPointerPath(childNode, 'src');
                        var dst_Path = self.core.getPointerPath(childNode, 'dst');
                        //var srcNode, dstNode;

                        // self.logger.info(src_Path);
                        // self.logger.info(dst_Path);
                        if (src_Path && dst_Path) {
                            var srcNode = self.pathToNode[src_Path];
                            var dstNode = self.pathToNode[dst_Path];
                            self.logger.info(self.core.getAttribute(childNode, 'name'));
                            self.logger.info('connects');
                            self.logger.info(self.core.getAttribute(srcNode, 'name'));
                            self.logger.info('-->');
                            self.logger.info(self.core.getAttribute(dstNode, 'name'));
                        }

                        // Add the logic if you have ConnectsTo relationship
                        if (self.isMetaTypeOf(srcNode, self.META['WebApplication']) === true && self.isMetaTypeOf(dstNode, self.META['DBApplication']) === true) {
                            self.logger.error("DB");
                            dbdependendency = true;
                            webdependent = true;

                        }

                        if (self.isMetaTypeOf(srcNode, self.META['Jupyter']) === true && self.isMetaTypeOf(dstNode, self.META['DataAnalyticsApp']) === true) {
                            self.logger.error("Jupyter");
                            jupyterdependendency = true;
                            analyticsModel.dataAnalyticsModel.jupyter = true;
                        }
                    }
                }
                for (i = 0; i < childrenPaths.length; i += 1) {
                    var childNode = self.pathToNode[childrenPaths[i]];
                    if (self.isMetaTypeOf(childNode, self.META['HostedOn']) === true) {
                        var childName = self.core.getAttribute(childNode, 'name');
                        // self.logger.info('At childNode', childName);
                        var src_Path = self.core.getPointerPath(childNode, 'src');
                        var dst_Path = self.core.getPointerPath(childNode, 'dst');

                        if (src_Path && dst_Path) {
                            var srcNode = self.pathToNode[src_Path];
                            var dstNode = self.pathToNode[dst_Path];

                            // self.logger.info(self.core.getAttribute(childNode, 'name'));
                            // self.logger.info('connects');
                            // self.logger.info(self.core.getAttribute(srcNode, 'name'));
                            // self.logger.info('-->');
                            // self.logger.info(self.core.getAttribute(dstNode, 'name'));
                            map.set((self.core.getAttribute(dstNode, 'name')), (self.core.getAttribute(srcNode, 'name')));
                        }

                        map.forEach(function (value, key) {
                            console.log(key.toString() + " : " + value.toString());
                        });

                        var src_node = self.core.getAttribute(srcNode, 'name');
                        // self.logger.info('At srcNode', src_node);

                        if (self.isMetaTypeOf(srcNode, self.META['WebApplication']) === true)
                            srcNodes.push('WebApplication');
                        else if (self.isMetaTypeOf(srcNode, self.META['DBApplication']) === true)
                            srcNodes.push('DBApplication');
                        else if (self.isMetaTypeOf(srcNode, self.META['DataAnalyticsApp']) === true)
                            srcNodes.push('DataAnalyticsApp');

                        var dst_node = self.core.getAttribute(dstNode, 'name');
                        // self.logger.info('At dstNode', dst_node);
                        if (self.isMetaTypeOf(dstNode, self.META['OpenStack']) === true) {
                            var flavor_name = self.core.getAttribute(dstNode, 'flavor_name');
                            dataModel.ansibleModel.flavor_name = flavor_name;
                            // self.logger.info(flavor_name);
                            var hostname = self.core.getAttribute(dstNode, 'hostname');
                            dataModel.ansibleModel.hostname = hostname;
                            // self.logger.info(hostname);

                            var vmName = self.core.getAttribute(dstNode, 'name');
                            dataModel.ansibleModel.VMName = vmName;
                            // self.logger.info(vmName);
                            var network = self.core.getAttribute(dstNode, 'network');
                            dataModel.ansibleModel.network = network;
                            // self.logger.info(network);

                            var imageName = self.core.getAttribute(dstNode, 'imageName');
                            dataModel.ansibleModel.imageName = imageName;
                            // self.logger.info(imageName);

                            var keyName = self.core.getAttribute(dstNode, 'keyName');
                            dataModel.ansibleModel.keyName = keyName;
                            // self.logger.info(keyName);


                            if (self.isMetaTypeOf(srcNode, self.META['WebApplication']) === true) {
                                wvisited = true;

                                webModel.WebApplicationModel.AppType = 'WebApplication';
                                var language = self.core.getAttribute(srcNode, 'language');
                                webModel.WebApplicationModel.language = language;
                                // self.logger.info(language);
                                var appName = self.core.getAttribute(srcNode, 'name');
                                webModel.WebApplicationModel.AppName = appName;
                                // self.logger.info(appName);
                                var srcPath = self.core.getAttribute(srcNode, 'src');
                                webModel.WebApplicationModel.srcPath = srcPath;
                                // self.logger.info(srcPath);


                                var acq_path = self.core.getChildrenPaths(srcNode);
                                for (j = 0; j < acq_path.length; j += 1) {
                                    acq_node = self.pathToNode[acq_path[j]];
                                    var webEngine = self.core.getAttribute(acq_node, 'name');
                                    webModel.WebApplicationModel.WebEngine = webEngine;
                                    // self.logger.info(webEngine);

                                }

                                var acq_path = self.core.getChildrenPaths(dstNode);
                                for (var j = 0; j < acq_path.length; j += 1) {
                                    var acq_node = self.pathToNode[acq_path[j]];
                                    var os_name = self.core.getAttribute(acq_node, 'name');
                                    dataModel.ansibleModel.OS.name = os_name;
                                    webModel.WebApplicationModel.OS.name = os_name;
                                    // self.logger.info(os_name);
                                    var os_version = self.core.getAttribute(acq_node, 'version');
                                    dataModel.ansibleModel.OS.version = os_version;
                                    webModel.WebApplicationModel.OS.version = os_version;
                                    // self.logger.info(os_version);
                                }

                            }

                            if (self.isMetaTypeOf(srcNode, self.META['DBApplication']) === true) {
                                wvisited = true;

                                dbModel.DBApplicationModel.AppType = 'DBApplication';
                                var user = self.core.getAttribute(srcNode, 'user');
                                dbModel.DBApplicationModel.user = user;
                                // self.logger.info(user);
                                var password = self.core.getAttribute(srcNode, 'password');
                                dbModel.DBApplicationModel.password = password;
                                // self.logger.info(password);
                                var appName = self.core.getAttribute(srcNode, 'name');
                                dbModel.DBApplicationModel.AppName = appName;
                                // self.logger.info(appName);
                                var srcPath = self.core.getAttribute(srcNode, 'src');
                                dbModel.DBApplicationModel.srcPath = srcPath;
                                // self.logger.info(srcPath);
                                var port = self.core.getAttribute(srcNode, 'port');
                                dbModel.DBApplicationModel.port = port;
                                // self.logger.info(port);
                                var dbnames = self.core.getAttribute(srcNode, 'dbnames');
                                dbModel.DBApplicationModel.dbnames = dbnames;
                                // self.logger.info(dbnames);
                                var dbLocation = self.core.getAttribute(srcNode, 'dbLocation');
                                dbModel.DBApplicationModel.dbLocation = dbLocation;
                                // self.logger.info(dbLocation);

                                var acq_path = self.core.getChildrenPaths(srcNode);
                                for (j = 0; j < acq_path.length; j += 1) {
                                    acq_node = self.pathToNode[acq_path[j]];
                                    var dbEngine = self.core.getAttribute(acq_node, 'name');
                                    dbModel.DBApplicationModel.dbEngine = dbEngine;
                                    // self.logger.info(dbEngine);
                                }
                                var acq_path = self.core.getChildrenPaths(dstNode);
                                for (var j = 0; j < acq_path.length; j += 1) {
                                    var acq_node = self.pathToNode[acq_path[j]];
                                    var os_name = self.core.getAttribute(acq_node, 'name');
                                    dataModel.ansibleModel.OS.name = os_name;
                                    dbModel.DBApplicationModel.OS.name = os_name;
                                    // self.logger.info(os_name);
                                    var os_version = self.core.getAttribute(acq_node, 'version');
                                    dataModel.ansibleModel.OS.version = os_version;
                                    dbModel.DBApplicationModel.OS.version = os_version;
                                    // self.logger.info(os_version);
                                }

                            }

                            if (self.isMetaTypeOf(srcNode, self.META['DataAnalyticsApp']) === true) {
                                analyticsModel.dataAnalyticsModel.AppType = 'DataAnalyticsApp';

                                var appName = self.core.getAttribute(srcNode, 'name');
                                analyticsModel.dataAnalyticsModel.AppName = appName;
                                self.logger.info(appName);

                                var srcPath = self.core.getAttribute(srcNode, 'src');
                                analyticsModel.dataAnalyticsModel.srcPath = srcPath;
                                self.logger.info(srcPath);

                                var replication_count = self.core.getAttribute(srcNode, 'replication_count');
                                analyticsModel.dataAnalyticsModel.replication_count = replication_count;
                                self.logger.info(replication_count);

                                var acq_path = self.core.getChildrenPaths(srcNode);
                                for (j = 0; j < acq_path.length; j += 1) {
                                    acq_node = self.pathToNode[acq_path[j]];
                                    var analyticsEngine = self.core.getAttribute(acq_node, 'name');
                                    analyticsModel.dataAnalyticsModel.analyticsEngine[j] = analyticsEngine;
                                    self.logger.info(analyticsEngine);


                                    var platformversion = self.core.getAttribute(acq_node, 'platformversion');
                                    analyticsModel.dataAnalyticsModel.platformVersion = platformversion;
                                    self.logger.info(platformversion);

                                }

                                var acq_path = self.core.getChildrenPaths(dstNode);
                                for (j = 0; j < acq_path.length; j += 1) {
                                    acq_node = self.pathToNode[acq_path[j]];
                                    var os_name = self.core.getAttribute(acq_node, 'name');
                                    analyticsModel.dataAnalyticsModel.OS.name = os_name;
                                    self.logger.info(os_name);
                                    var os_version = self.core.getAttribute(acq_node, 'version');
                                    analyticsModel.dataAnalyticsModel.OS.version = os_version;
                                    self.logger.info(os_version);
                                }

                            }


                            var fs = require('fs');
                            var sleep = require('sleep');
                            // var hostTempfile = "src/plugins/ansibleVMspawn/hostTemp" + vmName;

                            // console.log(dstNodes.indexOf(vmName));
                            var shell = require('shelljs');

                            if (dstNodes.indexOf(dst_node) === -1) {
                                openstackVMspawn.spawnVM(JSON.stringify(dataModel, null, 4));
                                sleep.sleep(10);
                                // console.log(JSON.stringify(dataModel, null, 4));
                                // console.log(vmName);
                                dstNodes.push(vmName);
                                var hostTempfile = "src/plugins/ansibleVMspawn/hostTemp" + vmName;
                                var touch = "touch " + hostTempfile;
                                shell.exec(touch, {async: true});
                            }
                            else if (dstNodes.indexOf(dst_node) > -1) {
                                console.log(dst_node + ' already exists');
                            }

                            console.log(dstNodes);
                            var w_visited = false;
                            var d_visited = false;
                            var da_visited = false;
                            console.log(srcNodes);


                            var sync = require('synchronize');
                            for (var tnodes = 0; tnodes < dstNodes.length; tnodes++) {
                                sleep.sleep(5);
                                var hostTempfile = "src/plugins/ansibleVMspawn/hostTemp" + dstNodes[tnodes];
                                console.log(map.get(dstNodes[tnodes]), "--->", dstNodes[tnodes]);

                                var connectedNode = map.get(dstNodes[tnodes]);

                                sync.fiber(function () {
                                    sync.await(populateModel(hostTempfile, connectedNode, sync.defer()));
                                });
                            }


                            function populateModel(hostTempfile, connectedNode) {
                                console.log("+++++", hostTempfile, "+++++");

                                sleep.sleep(5);
                                require('file-size-watcher').watch(hostTempfile).on('sizeChange',
                                    function callback(newSize, oldSize) {
                                        console.log(hostTempfile + 'The file size changed from ' + oldSize + ' to ' + newSize);
                                        console.log("========", hostTempfile, "===========");
                                        if (newSize > oldSize + 10) {
                                            // visited = true;
                                            sleep.sleep(5);
                                            // var src_node = self.core.getAttribute(srcNode, 'name');
                                            // // self.logger.info('At srcNode', src_node);

                                            var reader = fs.readFileSync(hostTempfile, 'utf8').trim();


                                            if ((webModel.WebApplicationModel.AppType === 'WebApplication')
                                                && (webModel.WebApplicationModel.AppName.trim() === connectedNode) && w_visited === false) {
                                                console.log(connectedNode, "%%%%%%%%", reader);
                                                w_visited = true;
                                                var host_ip = self.core.getAttribute(dstNode, 'host_ip');
                                                // console.log(reader.trim());
                                                webModel.WebApplicationModel.host_ip = reader;
                                                // self.logger.info(host_ip);
                                                console.log("+++++++++++++++src/plugins/ansibleVMspawn/hostTemp" + vmName);
                                                console.log(JSON.stringify(webModel, null, 4));
                                                sleep.sleep(5);
                                                //webAnsible.webgenerateAnsible(JSON.stringify(webModel, null, 4));
                                                if (dbdependendency === false) {
                                                    self.logger.error(" Run webAnsible..");
                                                    webAnsible.webgenerateAnsible(JSON.stringify(webModel, null, 4));
                                                }
                                            }


                                            if ((dbModel.DBApplicationModel.AppType === 'DBApplication')
                                                && (dbModel.DBApplicationModel.AppName.trim() === connectedNode) && d_visited === false) {
                                                console.log(connectedNode, "%%%%%%%%", reader);
                                                d_visited = true;
                                                var host_ip = self.core.getAttribute(dstNode, 'host_ip');
                                                // console.log(reader.trim());
                                                // var host_ip = reader.trim();
                                                dbModel.DBApplicationModel.host_ip = reader;
                                                // self.logger.info(host_ip);
                                                console.log("+++++++++++++++src/plugins/ansibleVMspawn/hostTemp" + vmName);
                                                console.log(JSON.stringify(dbModel, null, 4));
                                                sleep.sleep(2);
                                                //dbAnsible.dbgenerateAnsible(JSON.stringify(dbModel, null, 4));
                                                dbAnsible.dbgenerateAnsible(JSON.stringify(dbModel, null, 4));
                                                if (webdependent === true) {
                                                    self.logger.error(" Calling webAnsible..");
                                                    dbdependendency = false;
                                                    sleep.sleep(5);
                                                    webAnsible.webgenerateAnsible(JSON.stringify(webModel, null, 4));
                                                }
                                            }

                                            if ((analyticsModel.dataAnalyticsModel.AppType === 'DataAnalyticsApp')
                                                && (analyticsModel.dataAnalyticsModel.AppName.trim() === connectedNode) && da_visited === false) {
                                                console.log(connectedNode, "%%%%%%%%", reader);
                                                da_visited = true;
                                                var host_ip = self.core.getAttribute(dstNode, 'host_ip');
                                                console.log(reader.trim());
                                                analyticsModel.dataAnalyticsModel.host_ip = reader;
                                                self.logger.info(host_ip);
                                                console.log("+++++++++++++++src/plugins/ansibleVMspawn/hostTemp" + vmName);
                                                console.log(JSON.stringify(analyticsModel, null, 4));
                                                sleep.sleep(1);

                                                if (jupyterdependendency === true) {
                                                    self.logger.error(" Calling Jupyter..");

                                                    //sleep.sleep(5);
                                                    analyticsAnsible.analyticsgenerateAnsible(JSON.stringify(analyticsModel, null, 4));
                                                    jupyterdependendency = false;
                                                }
                                                else {

                                                    analyticsModel.dataAnalyticsModel.jupyter = false;
                                                    analyticsAnsible.analyticsgenerateAnsible(JSON.stringify(analyticsModel, null, 4));
                                                }
                                            }
                                        }
                                    });


                            } // populateModel ends
                        }
                    }
                }
                return dataModel;
            })
            .nodeify(callback);
    };
    return ansibleVMspawn;
});