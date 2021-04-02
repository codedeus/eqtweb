(function () {
    'use strict';
 
    angular
        .module('fuse')
        .factory('UtilityService', UtilityService);

    UtilityService.$inject = ['$interpolate', '$log', '$q', '$rootScope', '$mdDialog', 'StoreService', 'HmisConstants', 'msNavigationService', '$mdEditDialog', '$state', 'baseApiUrl'];

    function UtilityService($interpolate, $log, $q, $rootScope, $mdDialog, StoreService, HmisConstants, msNavigationService, $mdEditDialog, $state, baseApiUrl) {
        // var self = this;
        HmisConstants.baseApiUrl = baseApiUrl;
        var th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
        var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        var kb = ['Zero', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        var service = {
            CalculateAge: CalculateAge,
            FormatDate: FormatDate,
            ResizeBase64Img: ResizeBase64Img,
            FormatDateTime: FormatDateTime,
            showDialog: showDialog,
            showAlert: showAlert,
            importFromExcel: importFromExcel,
            processServiceBatchUpload: processServiceBatchUpload,
            exportToExcel: exportToExcel,
            stringToWords: stringToWords,
            CalculateDays: CalculateDays,
            showMessage,
            editProperty,
            editPropertyWithCb,
            displayNetworkError,
            toTitleCase,
            dateTimeParse,
            buildLocaleProvider
        };

        var self = service;
        return service;

        function CalculateAge(fromdate, todate) {
            if (todate) todate = new Date(todate);
            else todate = new Date();

            var age = [], fromdate = new Date(fromdate),
                y = [todate.getFullYear(), fromdate.getFullYear()],
                ydiff = y[0] - y[1],
                m = [todate.getMonth(), fromdate.getMonth()],
                mdiff = m[0] - m[1],
                d = [todate.getDate(), fromdate.getDate()],
                ddiff = d[0] - d[1];

            if (mdiff < 0 || (mdiff === 0 && ddiff < 0)) --ydiff;
            if (mdiff < 0) mdiff += 12;
            if (ddiff < 0) {
                fromdate.setMonth(m[1] + 1, 0);
                ddiff = fromdate.getDate() - d[1] + d[0];
                --mdiff;
            }

            return ydiff;
        }

        function CalculateDays(fromdate, todate) {
            let ends = moment(todate);
            let starts = moment(fromdate);
            let age = [];

            let years = ends.diff(starts, 'year');
            starts.add(years, 'years');

            let months = ends.diff(starts, 'months');
            starts.add(months, 'months');

            let days = ends.diff(starts, 'days');

            if (years > 0) age.push(years + ' year' + (years > 1 ? 's ' : ' '));
            if (months > 0) age.push(months + ' month' + (months > 1 ? 's ' : ' '));
            if (days > 0) age.push(days + ' day' + (days > 1 ? 's' : ''));
            if (age.length > 1) age.splice(age.length - 1, 0, ' ');

            return age.join('');

            //return (years + ' years ' + months + ' months ' + days + ' days');
        }

        function dateTimeParse(value) {
            var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
            var reISOUpdated = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:Z|(\+|-)([\d|:]*))?$/;
            var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
            if (angular.isString(value) || angular.isDate(value)) {
                var a = reISO.exec(value);
                if (a)
                    return FormatDate(new Date(value));
                a = reISOUpdated.exec(value);
                if (a) {
                    return FormatDate(new Date(value));
                }

                a = reMsAjax.exec(value);
                if (a) {
                    var b = a[1].split(/[-+,.]/);
                    return FormatDate(new Date(b[0] ? +b[0] : 0 - +b[1]));
                }
                if (angular.isDate(value)) {
                    return FormatDate(value);
                }
            }
            return value;
        }

        function FormatDate(date) {
            var newDate = date;

            if (date != undefined && date != 'N/A' && new Date(date) !== "Invalid Date" && !isNaN(new Date(date))) {

                date = new Date(date);
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                var month = date.getMonth() + 1;

                newDate = date.getDate() + "/" + month + "/" + date.getFullYear();

            }
            return newDate;
        }

        function FormatDateTime(date) {
            if (date != undefined && date != 'N/A' && new Date(date) !== "Invalid Date" && !isNaN(new Date(date))) {
                date = new Date(date);
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                var month = date.getMonth() + 1;
                return date.getDate() + "/" + month + "/" + date.getFullYear() + "  " + strTime;
            }
            else {
                return date;
            }
        }

        function buildLocaleProvider(formatString) {
            return {
                formatDate: function (date) {
                    if (date) return moment(date).format(formatString);
                    else return null;
                },
                parseDate: function (dateString) {
                    if (dateString) {
                        var m = moment(dateString, formatString, true);
                        return m.isValid() ? m.toDate() : new Date(NaN);
                    }
                    else return null;
                }
            };
        }

        function ResizeBase64Img(base64, width, height) {
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            var deferred = $.Deferred();
            $("<img/>").attr("src", "data:image/png;base64," + base64).load(function () {
                context.scale(width / this.width, height / this.height);
                context.drawImage(this, 0, 0);
                deferred.resolve($("<img/>").attr("src", canvas.toDataURL()));
            });
            return deferred.promise();
        }

        function showDialog(ev, templateFile, dialogData, ctrlr) {
            var deferred = $q.defer();
            $mdDialog.show({
                controller: ctrlr,
                controllerAs: "vm",
                locals: { dialogData: dialogData },
                templateUrl: 'app/main/dialogs/' + templateFile,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: true,
                multiple: true
                //  directive:importFromExcel
            })
                .then(function (data) {
                    deferred.resolve(data);
                }, function () {
                    //still do nothing
                });
            return deferred.promise;
        }

        function showAlert(type, content) {
            toastr[type](content);
        }

        function showMessage(title, content) {
            $mdDialog.show(
                $mdDialog.alert()
                    .title(title)
                    .multiple(true)
                    .textContent(content)
                    .ariaLabel('Alert Dialog')
                    .ok('Got It!'));
        }

        function importFromExcel(event, filePath, funcName) {
            if (event.target.files.length == 0) {
                return false;
            }

            if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {
                //var newFilePath = "";
                //newFilePath = filePath.split('\\').join('////');
                alasql('SELECT * FROM XLSX("' + filePath + '",{headers:true})', [], function (data) {

                    self[funcName](data);
                    // processData(data);
                });
            } else {
                alasql('SELECT * FROM FILE(?,{headers:true})', [event], function (data) {

                    self[funcName](data);
                    // processData(data);
                });
            }
        }

        function processServiceBatchUpload(data) {

            $rootScope.excelData = data; // $broadcast('import-excel-data', data);
            $rootScope.errorResult = [];
            $rootScope.dataForSaving = [];

            $rootScope.excelData.map(function (dataEntry) {
                var toAddForSaving = false;
                var revDeptExist = false;
                var serviceDeptExist = false;
                if (dataEntry.ServiceDepartmentCode != undefined && dataEntry.ServiceDepartmentCode != "" &&
                    dataEntry.RevenueDepartmentCode != undefined && dataEntry.RevenueDepartmentCode != "") {
                    StoreService.GetDepartmentByDepartmentCode(dataEntry.ServiceDepartmentCode).then(function (result) {
                        if (result.length <= 0) {
                            serviceDeptExist = false;
                        } else {
                            dataEntry.ServiceDepartmentId = result[0].Id;
                            serviceDeptExist = true;
                        }

                        //if (dataEntry.RevenueDepartmentCode != null) {
                        StoreService.GetDepartmentByRevDepartmentCode(dataEntry.RevenueDepartmentCode).then(function (revResult) {
                            if (revResult.length <= 0) {
                                revDeptExist = false;
                            } else {
                                revDeptExist = true;
                                dataEntry.RevenueDepartmentId = revResult[0].Id;
                            }

                            if (serviceDeptExist && revDeptExist) {
                                $rootScope.dataForSaving.push(dataEntry);
                            }

                            if (serviceDeptExist == false) {
                                $rootScope.errorResult.push('Service Department code (' + dataEntry.ServiceDepartmentCode + ') does not exist');
                            }

                            if (revDeptExist == false) {
                                $rootScope.errorResult.push('Revenue Department code (' + dataEntry.RevenueDepartmentCode + ') does not exist');
                            }
                        });
                        // } else {
                        //     if (toAddForSaving == true) {
                        //         $rootScope.dataForSaving.push(dataEntry);
                        //     }
                        //     if (serviceDeptExist == false) {
                        //         $rootScope.errorResult.push("Service Department code (" + dataEntry.ServiceDepartmentCode + ") does not exist");
                        //     }
                        // }
                    });
                }
            });
        }

        function exportToExcel(fileName, targetData) {

            if (!angular.isArray(targetData)) {
                $log.error('Can not export error type data to excel.');
                return;
            }

            if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {
                const fs = require('fs');
                const path = require('path');
                let date = new Date();

                const desktopDir = path.join(require('os').homedir(), 'Desktop');

                if (!fs.existsSync(desktopDir)) {
                    fs.mkdirSync(desktopDir);
                }
                fileName = fileName + " " + date.toString().split('GMT')[0].replace(/:/g, '');
                let downloadsdir = path.join(desktopDir, fileName + '.xlsx');

                alasql.promise('SELECT * INTO XLSX("' + downloadsdir + '",{headers:true}) FROM ?', [targetData]).then(function (res) {

                    showAlert('success', 'download successful. View the file at: ' + downloadsdir);
                }).catch(function (reason) {
                    if (reason.code == "EBUSY") {
                        showAlert('ERROR!', 'KINDLY CLOSE ALL OPEN INSTANCES OF : ' + downloadsdir + ' AND TRY AGAIN');
                    }
                })
            } else {
                alasql('SELECT * INTO XLSX("' + fileName + '.xlsx",{headers:true}) FROM ?', [targetData], function (response) {
                });
            }
        }

        function stringToWords(s) {
            s = parseFloat(Math.round(s * 100) / 100).toFixed(2).toString();
            s = s.replace(/[\, ]/g, '');
            if (s != parseFloat(s)) return 'not a number';
            var x = s.indexOf('.');
            if (x == -1) x = s.length;
            if (x > 15) return 'too big';
            var n = s.split('');
            var str = '';
            var sk = 0;
            var shouldAddKobo = false;
            //
            for (var i = 0; i < x; i++) {
                if ((x - i) % 3 == 2) {
                    if (n[i] == '1') {
                        str += tn[Number(n[i + 1])] + ' ';
                        i++;
                        sk = 1;
                    }
                    else if (n[i] != 0) {
                        str += tw[n[i] - 2] + ' ';
                        sk = 1;
                    }
                }
                else if (n[i] != 0) {
                    str += dg[n[i]] + ' ';
                    if ((x - i) % 3 == 0) {
                        str += 'hundred ';
                        if (i < n.length && i + 1 < n.length && (n[i + 1] != 0 || n[i + 2] != 0)) {
                            str += 'and ';
                        }
                    }
                    sk = 1;
                }

                if ((x - i) % 3 == 1) {
                    if (sk) {
                        let unit = th[(x - i - 1) / 3];
                        str += unit != '' ? (unit + ', ') : unit;
                    }
                    sk = 0;
                }
            }

            if (x != s.length) {

                var y = s.length;
                str += 'Naira ';

                for (var i = x + 1; i < y; i++) {
                    if ((y - i) % 3 == 2) {
                        if (n[i] == '1') {
                            str += tn[Number(n[i + 1])] + ' ';
                            i++;
                            sk = 1;
                            shouldAddKobo = true;
                        }
                        else if (n[i] != 0) {
                            str += tw[n[i] - 2] + ' ';
                            sk = 1;
                            shouldAddKobo = true;
                        }
                    }
                    else if (n[i] != 0) {
                        str += dg[n[i]] + ' ';
                        if ((y - i) % 3 == 0) {
                            str += 'hundred ';
                            if (i < n.length && i + 1 < n.length && (n[i + 1] != 0 || n[i + 2] != 0)) {
                                str += 'and ';
                            }

                        }
                        sk = 1;
                        shouldAddKobo = true;
                    }
                    if ((y - i) % 3 == 1) {
                        if (sk) str += th[(y - i - 1) / 3] + ' ';
                        sk = 0;
                    }
                }
                if (shouldAddKobo) {
                    str += ' Kobo Only.';
                }
                else {
                    str += ' Only.';
                }
            }
            else {
                str += 'Naira Only.';
            }

            return str.replace(/\s+/g, ' ');
        }

        function editPropertyWithCb(event, row, col, cb) {
            var editDialog = {
                modelValue: row[col],
                placeholder: col,
                save: cb,
                targetEvent: event,
                title: 'Change ' + col,
                validators: {
                    null: false
                }
            };
            var promise;
            promise = $mdEditDialog.large(editDialog);
            promise.then(function (ctrl) {
                let input = ctrl.getInput();
            });
        }

        function editProperty(event, row, col) {
            let deferred = $q.defer();
            var editDialog = {
                modelValue: row[col],
                placeholder: col,
                save: function (input) {
                    if (input.$modelValue == "" || input.$modelValue == 'undefined' || input.$modelValue == null) {
                        input.$invalid = true;
                        return $q.reject();
                    }
                    row[col] = input.$modelValue;
                    deferred.resolve(row);
                },
                targetEvent: event,
                title: 'Change ' + col,
                validators: {
                    null: false
                }
            };
            var promise;
            promise = $mdEditDialog.large(editDialog);
            promise.then(function (ctrl) {
                let input = ctrl.getInput();

                // input.$viewChangeListeners.push(function() {
                //     input.$setValidity('test', input.$modelValue !== 'test');
                // });
            });
            return deferred.promise;
        }

        function displayNetworkError(message) {
            $rootScope.processingRequest = false;
            var errorMsg = "";

            switch (message.status) {
                case 400:
                    errorMsg = message.data;
                    break;
                case 401:
                    errorMsg = "Unauthorized User. Please kindly login to proceed";
                    delete localStorage.authToken;
                    $state.go('app.login');
                    break;
                case 500:
                    errorMsg = "oops. something has gone wrong. please contact admin"
                    break;
                default:
                    errorMsg = 'Server not reachable. Check your internet settings or contact your network admin';
            }

            $mdDialog.show(
                $mdDialog.alert()
                    .title('error!')
                    .multiple(true)
                    .textContent(errorMsg)
                    .ariaLabel('Alert Dialog')
                    .ok('Got It!'));
        }

        function toTitleCase(str) {
            return str.replace(
                /\w\S*/g,
                function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }

        // a and b are javascript Date objects
        function dateDiffInDays(a, b) {
            // Discard the time and time-zone information.
            const _MS_PER_DAY = 1000 * 60 * 60 * 24;

            const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

            return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY));
        }

    }
})();
