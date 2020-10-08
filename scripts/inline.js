"use strict";

Date.prototype.getUTCUnixTime =  function (){
  return Math.floor( new Date(
    this.getUTCFullYear(),
    this.getUTCMonth(),
    this.getUTCDate(),
    this.getUTCHours(),
    this.getUTCMinutes(), 
    this.getUTCSeconds()
  ).getTime() / 1000); 
}

var _acChromeTemplates = {
    "taskList": "<a> Copy \"this\" </a>",
    "objectActions": "<div id=\"with-init\" ng-init=\"window.console.log('init (template)!!!')\"><ul class=\"menu_list\" ng-if=\"!object || ( object.class === 'Task' ) && __projects__.length\" style=\"max-width: calc(90%);\"><li style=\"padding: 3px;\"><div class=\"acChrome-row row\" style=\"display: flex;\"><select style=\"flex: 90;\" ng-model=\"targetProject\" ng-options=\"proj.name for proj in __projects__ | orderBy: 'name'\"></select><a class=\"button tiny icon icon_clone_black\" href=\"\" ng-click=\"copyTask(targetProject)\" style=\"margin: 0; display: inline-block; min-width: 32px; min-height: 32px; flex: 1;\" title=\"Copy task\" ng-disabled=\"!targetProject\"></a></div></li></ul></div>",
    "taskFooter": "<div ng-repeat=\"syncTask in syncedTasks\" class=\"able-canyon-internal-reference\">Able Canyon Internal Reference: <a ng-href=\"projects/{{syncTask.projectId}}/tasks/{{syncTask.taskId}}\"> {{syncTask.taskId}} </a></div>",
    "taskPanelPopover": "<a href=\"\" ng-click=\"copyTask()\" ng-repeat=\"proj in $root._acChrome.getProjects()\"> Copy Task</a>"
};
;var _name = 'x' + Date.now().toString(34);

function setWindowName() {
    var name = window.name.split('!');
    window.name = 'NG_ENABLE_DEBUG_INFO!';
    window.name = 'NG_DEFER_BOOTSTRAP!';
    window.name += _name;
}

setWindowName();
;

;(function () {
    'use strict';
    objectActionDecorator.$inject = ["$delegate", "TasksFactory", "LabelsFactory", "CollectionsFactory"];
    PageCtrlDecroator.$inject = ["$delegate", "$injector"];
    var cntr = 0;
    var timer;
    var __DEBUG = true;
    var console = __DEBUG ? window.console : {
        log: function log() {
        }, info: function info() {
        }, warn: function warn() {
        }, error: function error() {
        }
    };
    var _ = window._.noConflict();
    setWindowName();

    var DEFAULT_TASK_ATTRS = ['name', 'body', 'subtasks', 'labels', 'is_hidden_from_clients', 'is_important', 'start_on', 'due_on'];

    function __eq__arr__(a, b) {
        if (!(a && b)) return false;
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function normalize(a) {
        if (typeof a === 'undefined') return null;
        if (a === '') return null;
        return a;
    }

    function __eq__(a, b, attrs) {
        if (arguments.length === 2) return __eq__arr__.apply(this, arguments);
        for (var i = 0; i < attrs.length; i++) {
            if (normalize(a[attrs[i]]) !== normalize(b[attrs[i]])) {
                console.warn(attrs[i] + ' does not match');
                console.warn(a[attrs[i]], b[attrs[i]]);
                return false;
            }
        }
        return true;
    }

    function hasKeys(obj, keys) {
        return _.every(keys, _.partial(_.has, obj));
    }

    function findScope(scope, attrs) {
        if (hasKeys(scope, attrs)) return scope;
        if (hasKeys(scope.$$childHead, attrs)) return scope.$$childHead;
        var parent = scope.$parent;
        for (var i = 0; i < 5 && parent; i++) {
            if (hasKeys(parent, attrs)) return parent;
            parent = parent.$parent;
        }
        return scope;
    }

    var TasksFactory, CollectionsFactory, LabelsFactory, TaskListsFactory, $q, DataFactory;

    function getAttachments(task) {
        window.task = task;
        var attachments = task.attachments.map(function (att) {
            return {name: att.name, md5: getFileHash(att.download_url), object: att};
        });
        return _.uniqBy(attachments, 'md5');
    }

    function getFileHash(url) {
        return url.split(/[^a-z0-9]/).find(function (a) {
            return a.match(/^[a-z0-9]{32}$/);
        });
    }

    function findTaskList(project, taskListName) {
        var taskLists, taskList, ret;
        return regeneratorRuntime.async(function findTaskList$(context$2$0) {
            while (1) {
                switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        console.warn('finding task list ', taskListName);
                        context$2$0.next = 3;
                        return regeneratorRuntime.awrap(TasksFactory.findByProject(project.id));
                    case 3:
                        taskLists = context$2$0.sent;
                        taskList = taskLists.task_lists.find(function (a) {
                            return a.name === taskListName;
                        });
                        if (!taskList) {
                            context$2$0.next = 7;
                            break;
                        }
                        return context$2$0.abrupt("return", taskList);
                    case 7:
                        taskList = {name: taskListName};
                        context$2$0.next = 10;
                        return regeneratorRuntime.awrap(TaskListsFactory.add(project, taskList));
                    case 10:
                        ret = context$2$0.sent;
                        console.warn(ret);
                        return context$2$0.abrupt("return", ret);
                    case 13:
                    case"end":
                        return context$2$0.stop();
                }
            }
        }, null, this);
    }

    function reupload(att) {
        var resp, blob;
        return regeneratorRuntime.async(function reupload$(context$2$0) {
            while (1) {
                switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        context$2$0.next = 2;
                        return regeneratorRuntime.awrap(window.fetch(att.object.download_url));
                    case 2:
                        resp = context$2$0.sent;
                        context$2$0.next = 5;
                        return regeneratorRuntime.awrap(resp.blob());
                    case 5:
                        blob = context$2$0.sent;
                        blob.name = att.object.name;
                        if (blob.upload) blob.upload.name = att.object.name;
                        context$2$0.next = 10;
                        return regeneratorRuntime.awrap(DataFactory.uploadSingle(new File([blob], att.object.name)));
                    case 10:
                        return context$2$0.abrupt("return", context$2$0.sent);
                    case 11:
                    case"end":
                        return context$2$0.stop();
                }
            }
        }, null, this);
    }

    function initNotifications() {
        var notificationElm = document.createElement('div');
        notificationElm.id = 'chrome--ext--notification';
        notificationElm.innerText = 'Notification';
        document.documentElement.appendChild(notificationElm);
        var style = document.createElement('style');
        style.textContent = "\n    #chrome--ext--notification {\n      position: fixed;\n      top: -128px;\n      left: 0;\n      right: 0;\n      margin-right: auto;\n      margin-left:  auto;\n      background: orange;\n      z-index: 999999;\n      transition: top 0.3s ease;\n      min-height: 3px;\n    }\n    @keyframes loading-anim {\n      0% {\n        background-position-x: -" + screen.width + "px;\n      }\n      100% {\n        background-position-x: " + screen.width + "px;\n      }\n    }\n    #chrome--ext--notification.loading {\n        background: linear-gradient(left, transparent 33%, orange 33%, orange 66%, transparent 66%);\n        background: -webkit-linear-gradient(left, transparent 33%, orange 33%, orange 66%, transparent 66%);\n        animation: loading-anim 10s linear infinite;\n    }\n    #chrome--ext--notification.visible {\n      top: 0;\n    }\n  ";
        document.documentElement.appendChild(style);

        function show(txt) {
            notificationElm.innerText = txt || '';
            notificationElm.classList.add('visible');
            notificationElm.classList.remove('loading');
        }

        function hide() {
            notificationElm.classList.remove('visible');
            notificationElm.classList.remove('loading');
        }

        function setBusy() {
            notificationElm.classList.add('visible');
            notificationElm.classList.add('loading');
            notificationElm.innerText = '';
        }

        return {show: show, setBusy: setBusy, hide: hide};
    }

    var Notifications;
    var loaded = false;
    window.init = init;

    function enableDebug() {
        angular.module('AngieApplication').config(["$compileProvider", function ($compileProvider) {
            console.log('enable confg!!!!');
        }]);
    }

    function init() {
        console.log('Starting init()');
        loaded = true;
        setWindowName();
        Notifications = initNotifications();
        var angieTemplates = window.angie.templates;
        var tmpl;
        tmpl = '/environment/directives/object_actions.html';
        angieTemplates[tmpl] = angieTemplates[tmpl].replace('</ul>', "</ul>" + _acChromeTemplates.objectActions);
        tmpl = '/tasks/views/project_task.html';
        angieTemplates[tmpl] = angieTemplates[tmpl].replace('<div class="task_main project_object">', '<div class="task_main project_object">' + _acChromeTemplates.taskFooter);
        tmpl = '/tasks/directives/task_panel_popover.html';
        angieTemplates[tmpl] = angieTemplates[tmpl].replace('<div class="task_panel_actions"', _acChromeTemplates.objectActions + "<div class=\"task_panel_actions\"");

        angular.module('ang.environment').config(["$provide", function ($provide) {
            window.$provide = $provide;
            $provide.decorator('objectActionsDirective', objectActionDecorator);
        }]);

        angular.module('ac.tasks').config(["$provide", function ($provide) {
            $provide.decorator('taskPanelDirective', objectActionDecorator);
            $provide.decorator('$controller', PageCtrlDecroator);
        }]);

        console.log('Config done');

        angular.module('ang.environment').run(['$rootScope', 'TasksFactory', 'DataFactory', 'TaskListsFactory', '$rootElement', function ($rootScope, TasksFactory, DataFactory, TaskListsFactory, $rootElement) {
            console.log('ang.environment run!!!');
            $rootScope._acChrome = {
                getProjects: function getProjects() {
                    return window.angie.collections.projects;
                }
            };
            console.log('ac.tasks???');
            $rootScope.copyTask = copyTask;

            function copyTask(project, opts, scope) {
                var newLabel, hasLabel, taskData, targetTaskList, taskList, attachments, filesCodes, i, fileCode,
                    newTask, taskLabels, lbl, tsk, resp;
                return regeneratorRuntime.async(function copyTask$(context$4$0) {
                    while (1) {
                        switch (context$4$0.prev = context$4$0.next) {
                            case 0:
                                Notifications.setBusy();
                                scope = findScope(scope, ['saveChanges', 'task', 'task_attributes']);
                                console.log('finding scope %o', scope);
                                newLabel = {
                                    id: window.angie.functions.random_hash(),
                                    is_new: true,
                                    name: "sync-" + opts.project.id + "-" + project.id + "-" + scope.task.id
                                };
                                hasLabel = scope.task_attributes.labels.some(function (a) {
                                    return a.name.match(/sync-\d+-\d+/);
                                });
                                if (hasLabel) {
                                    context$4$0.next = 42;
                                    break;
                                }
                                scope.task_attributes.labels.push(newLabel);
                                taskData = _.pick(scope.task_attributes, DEFAULT_TASK_ATTRS);

                                targetTaskList = scope.task_lists.find(function (a) {
                                    return a.id === scope.task.task_list_id;
                                });
                                context$4$0.next = 11;
                                return regeneratorRuntime.awrap(findTaskList(project, targetTaskList.name));
                            case 11:
                                taskList = context$4$0.sent;
                                console.warn('task list', taskList);
                                taskData.task_list_id = taskList.id;
                                attachments = getAttachments(scope.task);
                                filesCodes = [];
                                i = 0;
                            case 17:
                                if (!(i < attachments.length)) {
                                    context$4$0.next = 25;
                                    break;
                                }
                                context$4$0.next = 20;
                                return regeneratorRuntime.awrap(reupload(attachments[i]));
                            case 20:
                                fileCode = context$4$0.sent;
                                filesCodes.push(fileCode);
                            case 22:
                                i++;
                                context$4$0.next = 17;
                                break;
                            case 25:
                                taskData.attach_uploaded_files = filesCodes;
                                context$4$0.next = 28;
                                return regeneratorRuntime.awrap(TasksFactory.add(project, taskData));
                            case 28:
                                newTask = context$4$0.sent;
                                taskLabels = angular.copy(newTask.labels);
                                lbl = taskLabels.find(function (a) {
                                    return a.name === newLabel.name;
                                });
                                lbl.name += '-' + newTask.id;
                                context$4$0.next = 34;
                                return regeneratorRuntime.awrap(TasksFactory.update(newTask, {labels: taskLabels}));
                            case 34:
                                tsk = context$4$0.sent;
                                scope.task_attributes.labels.find(function (a) {
                                    return a.name === newLabel.name;
                                }).name = lbl.name;
                                context$4$0.next = 38;
								console.log("before scope.saveChanges()");
                                return regeneratorRuntime.awrap(scope.saveChanges());
                            case 38:
                                resp = context$4$0.sent;
                                console.log('task synced');
                                Notifications.hide();
                                return context$4$0.abrupt("return", resp);
                            case 42:
                            case"end":
                                return context$4$0.stop();
                        }
                    }
                }, null, this);
            }
        }]);

        function resume() {
            window.angular.resumeBootstrap();
        }

        setTimeout(resume, 10);
    }

    function parseLabel(label, projectId) {
        var segs = label.split('-');
        var isParentProject = "" + segs[1] === "" + projectId;
        var srcProjectId = isParentProject ? segs[1] : segs[2], targetProjectId = isParentProject ? segs[2] : segs[1],
            taskId = isParentProject ? segs[3] : segs[4], targetTaskId = isParentProject ? segs[4] : segs[3];
        return {isParent: isParentProject, projectId: targetProjectId, taskId: targetTaskId};
    }

    function PageCtrlDecroator($delegate, $injector) {
        return function (constructor, locals, later, ident) {
            TasksFactory = $injector.get('TasksFactory');
            CollectionsFactory = $injector.get('CollectionsFactory');
            LabelsFactory = $injector.get('LabelsFactory');
            TaskListsFactory = $injector.get('TaskListsFactory');
            $q = $injector.get('$q');
            DataFactory = $injector.get('DataFactory');
            var args = Array.prototype.slice.call(arguments, 0);
            var ret = $delegate.apply(this, args);
            if (typeof constructor === 'string' && locals.$scope && !locals.$scope.controllerName) {
                console.warn(constructor);
                if (constructor === 'ProjectTasksController' || constructor === 'ProjectTemplateTaskController') {
                    var syncTaskList = function syncTaskList(task, taskList, syncedTasks) {
                        var i, targetTask_, targetTask, project, targetTaskList, resp;
                        return regeneratorRuntime.async(function syncTaskList$(context$4$0) {
                            while (1) {
                                switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        i = 0;
                                    case 1:
                                        if (!(i < syncedTasks.length)) {
                                            context$4$0.next = 18;
                                            break;
                                        }
                                        targetTask_ = syncedTasks[i];
                                        context$4$0.next = 5;
                                        return regeneratorRuntime.awrap(TasksFactory.findById(targetTask_.taskId, targetTask_.projectId));
                                    case 5:
                                        targetTask = context$4$0.sent;
                                        project = window.angie.collections.projects.find(function (a) {
                                            return a.id == targetTask_.projectId;
                                        });
                                        if (project) {
                                            context$4$0.next = 9;
                                            break;
                                        }
                                        throw new Error('no project!' + targetTask_.projectId);
                                    case 9:
                                        context$4$0.next = 11;
                                        return regeneratorRuntime.awrap(findTaskList(project, taskList.name));
                                    case 11:
                                        targetTaskList = context$4$0.sent;
                                        context$4$0.next = 14;
                                        return regeneratorRuntime.awrap(TasksFactory.update(targetTask, {task_list_id: targetTaskList.id}));
                                    case 14:
                                        resp = context$4$0.sent;
                                    case 15:
                                        i++;
                                        context$4$0.next = 1;
                                        break;
                                    case 18:
                                    case"end":
                                        return context$4$0.stop();
                                }
                            }
                        }, null, this);
                    };
                    var ctrl = locals, scope = locals.$scope;
                    var reorderTasksOrg = scope.reorderTasks;
                    scope.reorderTasks = function (task_id, task_list_id, position) {
                        var task = scope.$resolve.tasks.tasks.find(function (a) {
                            return a.id === task_id;
                        });
                        var taskList = scope.task_lists.find(function (a) {
                            return a.id === task_list_id;
                        });
                        console.log(task);
                        var syncedTasks = task.labels.map(function (lbl) {
                            return parseLabel(lbl.name, task.project_id);
                        });
                        syncTaskList(task, taskList, syncedTasks);
                        return reorderTasksOrg.apply(this, arguments);
                    };
                    ;
                }
                if (constructor === 'ProjectTaskController' || constructor === 'ProjectTaskFormController') {
                    var filesChanged = function filesChanged() {
                        if (!scope.__files__) return false;
                        var ret = !_.isEqual(getAttachmentHashes(), scope.__files__);
                        if (ret) console.log('fileChanged', ret, getAttachmentHashes(), scope.__files__);
                        return ret;
                    };
                    var taskChanged = function taskChanged(a, b) {
                        return a && b && !__eq__(a, b, ['name', 'body', 'start_on', 'due_on', 'is_important', 'task_list_id']) || filesChanged();
                    };
                    var uploadFiles = function uploadFiles(attachments) {
                        var filesCodes, i, upload;
                        return regeneratorRuntime.async(function uploadFiles$(context$4$0) {
                            while (1) {
                                switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        console.log('uploadFiles, async function');
                                        filesCodes = [];
                                        i = 0;
                                    case 3:
                                        if (!(i < attachments.length)) {
                                            context$4$0.next = 11;
                                            break;
                                        }
                                        context$4$0.next = 6;
                                        return regeneratorRuntime.awrap(reupload(attachments[i]));
                                    case 6:
                                        upload = context$4$0.sent;
                                        filesCodes.push(upload.code);
                                    case 8:
                                        i++;
                                        context$4$0.next = 3;
                                        break;
                                    case 11:
                                        return context$4$0.abrupt("return", filesCodes);
                                    case 12:
                                    case"end":
                                        return context$4$0.stop();
                                }
                            }
                        }, null, this);
                    };
                    var syncAttachments = function syncAttachments(src, target) {
                        var filesCodes, defer, srcAttachments, targetAttachments, filesToRemove, filesToAdd, i,
                            fileCode;
                        return regeneratorRuntime.async(function syncAttachments$(context$4$0) {
                            while (1) {
                                switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        filesCodes = [];
                                        defer = new $q.defer();
                                        srcAttachments = getAttachments(src), targetAttachments = getAttachments(target);
                                        filesToRemove = _.differenceBy(targetAttachments, srcAttachments, 'md5'), filesToAdd = _.differenceBy(srcAttachments, targetAttachments, 'md5');
                                        window.att = {src: srcAttachments, trgt: targetAttachments};
                                        console.log('adding', filesToAdd, 'removing', filesToRemove);
                                        i = 0;
                                    case 7:
                                        if (!(i < filesToAdd.length)) {
                                            context$4$0.next = 15;
                                            break;
                                        }
                                        context$4$0.next = 10;
                                        return regeneratorRuntime.awrap(reupload(filesToAdd[i]));
                                    case 10:
                                        fileCode = context$4$0.sent;
                                        filesCodes.push(fileCode.code);
                                    case 12:
                                        i++;
                                        context$4$0.next = 7;
                                        break;
                                    case 15:
                                        return context$4$0.abrupt("return", {
                                            attach_uploaded_files: filesCodes,
                                            drop_attached_files: filesToRemove.map(function (a) {
                                                return a.object.id;
                                            })
                                        });
                                    case 16:
                                    case"end":
                                        return context$4$0.stop();
                                }
                            }
                        }, null, this);
                    };
                    var syncTasks = function syncTasks() {
                        var syncLabels, i, taskData, label, targetTask, targetProject, task, attachments, srcTaskList,
                            taskList, res;

                        console.log('Syncing tasks');

                        return regeneratorRuntime.async(function syncTasks$(context$4$0) {
                            while (1) {
								console.log(context$4$0, context$4$0.prev, context$4$0.next);
                                switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        context$4$0.prev = 0;
                                        Notifications.setBusy();
                                        syncLabels = scope.task.labels.map(function (a) {
                                            return a.name;
                                        }).filter(function (a) {
                                            return a.startsWith('sync-');
                                        });
                                        i = 0;
                                    case 4:
                                        if (!(i < syncLabels.length)) {
                                            context$4$0.next = 32;
                                            break;
                                        }
                                        taskData = _.pick(scope.task, DEFAULT_TASK_ATTRS);

                                        if (taskData.due_on) {
                                            taskData.due_on = new Date(taskData.due_on * 1000).toISOString().substr(0, 10);
                                        }

                                        if (taskData.start_on) {
                                            taskData.start_on = new Date(taskData.start_on * 1000).toISOString().substr(0, 10);
                                        }

                                        label = syncLabels[i];
                                        targetTask = parseLabel(label, scope.project.id);
                                        targetProject = window.angie.collections.projects.find(function (a) {
                                            return a.id == targetTask.projectId;
                                        });
                                        if (targetProject) {
                                            context$4$0.next = 11;
                                            break;
                                        }
                                        throw new Error('Project not found');
                                    case 11:
                                        context$4$0.next = 13;
                                        return regeneratorRuntime.awrap(TasksFactory.findById(targetTask.taskId, targetTask.projectId));
                                    case 13:
                                        task = context$4$0.sent;
                                        if (task) {
                                            context$4$0.next = 16;
                                            break;
                                        }
                                        return context$4$0.abrupt("continue", 29);
                                    case 16:
                                        context$4$0.next = 18;
                                        return regeneratorRuntime.awrap(syncAttachments(scope.task, task));
                                    case 18:
                                        attachments = context$4$0.sent;
                                        angular.extend(taskData, attachments);
                                        srcTaskList = scope.task_lists.find(function (a) {
                                            return a.id === scope.task.task_list_id;
                                        });
                                        context$4$0.next = 23;
                                        return regeneratorRuntime.awrap(findTaskList(targetProject, srcTaskList.name));
                                    case 23:
                                        taskList = context$4$0.sent;
                                        console.warn('task list', taskList);
                                        taskData.task_list_id = taskList.id;
                                        context$4$0.next = 28;
                                        return regeneratorRuntime.awrap(TasksFactory.update(task, taskData));
                                    case 28:
                                        res = context$4$0.sent;
                                    case 29:
                                        i++;
                                        context$4$0.next = 4;
                                        break;
                                    case 32:
                                        Notifications.hide();
                                        context$4$0.next = 39;
                                        break;
                                    case 35:
                                        context$4$0.prev = 35;
                                        context$4$0.t0 = context$4$0["catch"](0);
                                        console.warn(context$4$0.t0);
                                        Notifications.show(context$4$0.t0);
                                    case 39:
                                    case"end":
                                        return context$4$0.stop();
                                }
                            }
                        }, null, this, [[0, 35]]);
                    };
                    var getAttachmentHashes = function getAttachmentHashes() {
                        var hashes = scope.task.attachments.map(function (a) {
                            return getFileHash(a.download_url);
                        });
                        return _.uniq(hashes);
                    };
                    var getSyncProjects = function getSyncProjects() {
                        if (!scope.task) return;
                        scope.syncLabels = scope.task.labels.map(function (a) {
                            return a.name;
                        }).filter(function (a) {
                            return a.startsWith('sync-');
                        });
                        scope.__files__ = getAttachmentHashes();
                        scope.syncedTasks = scope.syncLabels.map(function (a) {
                            return parseLabel(a, scope.project.id);
                        });
                        scope.syncProjects = {};
                        for (var i = 0; i < scope.syncLabels.length; i++) {
                            var segs = scope.syncLabels[i].split('-');
                            scope.syncProjects[segs[1]] = true;
                            scope.syncProjects[segs[2]] = true;
                        }
                    };
                    var ctrl = locals, scope = locals.$scope;
                    scope.copyTask = scope.$root.copyTask;
                    ;
                    if (constructor === 'ProjectTaskFormController') {
                        var ctrl = locals, scope = locals.$scope;
                        var orgSumbitForm = scope.submitForm;
                        scope.submitForm = function () {
                            var ret = orgSumbitForm.apply(scope, arguments);
                            ret.then(function (task) {
                                setTimeout(function (_) {
                                    var checkElm = document.querySelector('[ng-model="task_attributes.is_important"]');
                                    checkElm.click();
                                    setTimeout(function (_) {
                                        checkElm.click();
                                    }, 500);
                                }, 1066);
                            });
                            return ret;
                        };
                    }
                    scope.$watch('task', function (a, b) {
                        console.warn('Checking for task change: ', a.name, b.name);
                        if (taskChanged(a, b) || taskChanged(scope.task, scope.task_attributes)) {
                            console.warn('Task change detected');
                            if (scope.__isSyncing) return;
                            if (!scope.__skip__) {
                                Notifications.setBusy();
                                syncTasks().then(Notifications.hide).catch(Notifications.show);
                            }
                            console.warn('Syncing task');
                        }
                        
                        getSyncProjects();
                    }, true);
					/*document.getElementsByTagName("body")[0].addEventListener("click", function(e){*/
					window.jQuery("body").on("click", ".DayPicker-Day", function(e){
						var obj = e.target;
						//if(obj.className === "DayPicker-Day"){
							var type = window.jQuery(this).closest(".calendarBorder").data("qaId");
							var datePickersLen = window.jQuery(".calendarBorder").length;
							console.log("DayPicker-Day Clicked ", obj.getAttribute("aria-label"), new Date(obj.getAttribute("aria-label")));
							setTimeout(function(){
								scope.$apply(function(x){
									console.log(x, scope.task);
									/*scope.task.body = "modfied description by code";*/
									var d = new Date(obj.getAttribute("aria-label"));
									if(type === "due-date-picker"){
										/*scope.task.due_on = (d.getTime()+ d.getTimezoneOffset()*60*1000)/1000;*/
										/*scope.task.due_on = (new Date(d.toUTCString()).getTime())/1000;*/
										console.log(scope.task.start_on, scope.task.due_on);
										var date = (new Date( d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" 00:00:00.000Z" )).getTime()/1000;
										scope.task.due_on = date;
										if(datePickersLen === 1){/* no start date */
											scope.task.start_on = date;
										}
									}else if(type === "start-date-picker"){
										/*scope.task.start_on = (d.getTime()+ d.getTimezoneOffset()*60*1000)/1000;*/
										/*scope.task.start_on = (new Date(d.toUTCString()).getTime())/1000;*/
										console.log(scope.task.start_on, scope.task.due_on);
										scope.task.start_on = (new Date( d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" 00:00:00.000Z" )).getTime()/1000;
									}
								});
								/*console.log("DayPicker-Day Settimeout");
								if (scope.__isSyncing) return;
								if (!scope.__skip__) {
									Notifications.setBusy();
									syncTasks().then(Notifications.hide).catch(Notifications.show);
								}
								getSyncProjects();*/
							}, 1500)
						//}
					});
                }
            }
            return ret;
        };
    }

    function objectActionDecorator($delegate, TasksFactory, LabelsFactory, CollectionsFactory) {
        var directive = $delegate[0];
        console.log('objectActionDecorator');
        console.log($delegate);
        var orgLink = directive.link;
        var link = function link(scope, element, attr) {
            var ret = orgLink.apply(directive, arguments);
            scope.getProjects = function () {
                if (!scope.syncProjects) return [];
                return window.angie.collections.projects.filter(function (proj) {
                    return !scope.syncProjects[proj.id] && proj.id !== scope.project.id;
                });
            };
            scope.object = scope.object || scope.task;

            function getSyncProjects() {
                if (!scope.object.labels) return;
                scope.syncLabels = scope.object.labels.map(function (a) {
                    return a.name;
                }).filter(function (a) {
                    return a.startsWith('sync-');
                });
                scope.syncProjects = {};
                for (var i = 0; i < scope.syncLabels.length; i++) {
                    var segs = scope.syncLabels[i].split('-');
                    scope.syncProjects[segs[1]] = true;
                    scope.syncProjects[segs[2]] = true;
                }
                scope.__projects__ = scope.getProjects();

                console.info('Projects: ', scope.getProjects());
            }

            scope.$watch('object', getSyncProjects);
            var opts = {};
            if (!scope.project && scope.additional) scope.project = scope.additional.project;
            scope.copyTask = function (project) {
                console.warn('copytask...');
                if (scope.popover) scope.popover.close();
                opts.project = scope.project;
                return scope.$root.copyTask(project, opts, scope.$parent);
            };
            return ret;
        };
        directive.link = link;
        directive.compile = function () {
            return link;
            // return directive;
        };
        return $delegate;
    }

    (function _next() {// return;
        if (loaded) return;// if(window.angular) enableDebug();
        if (!(window.angie && window.angie.templates)) return setTimeout(_next, 10);
        if (!angie.all_loaded) return setTimeout(_next, 10);
        init();
    })();// document.addEventListener('DOMContentLoaded', init);
})();
;