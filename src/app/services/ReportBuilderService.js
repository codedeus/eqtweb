(function () {
  'use strict';

  angular
    .module('fuse')
    .factory('ReportBuilderService', ReportBuilderService);

  ReportBuilderService.$inject = ['$rootScope', 'HmisConstants', 'StoreService', 'UtilityService','baseApiUrl'];

  function ReportBuilderService($rootScope, HmisConstants, StoreService, UtilityService,baseApiUrl) {
    var imageUrl;
    var imageString;
    var hospitalName;
    HmisConstants.baseApiUrl = baseApiUrl;
    //getLogoAndHospitalName();
    toDataURL('./assets/images/logos/logo.png', function (dataUrl) {
      imageUrl = dataUrl;
    });
    var service = {
      toDataURL,
      BuildPdfContent: BuildPdfContent,
      buildReportHeader: buildReportHeader,
      BuildPDFText: BuildPDFText,
      displayOrPrintPdf: displayOrPrintPdf,
      textToBase64Barcode: textToBase64Barcode,
      buildtable: buildtable,

      printSchemePaymentReport,
      buildFluidBalanceEntry,
      printClerkingDrugRequest,
      printSettlementSharing,
      printRequestSlip,
      settlementFeePartyDetails,
      printInvoiceSlip,
      table,
      buildTableBody,
      downloadLeaseInvoice
    };

    return service;

    function textToBase64Barcode(text, height, width,showValue) {
      height = height || 50;
      width = width || 2;
      var canvas = document.createElement("canvas");

      JsBarcode(canvas, text, {
        fontSize:20,
        bold:true,
        fontOptions:"bold",
        width:width || 2,
        height:height || 50,
        displayValue: showValue,
        format:'CODE128'
      });
      return canvas.toDataURL("image/png");
    }

    function BuildPdfContent(reportObject, marginData, noBorders) {
      var pdfContent = {};
 
      var content = [];
      var parentGroupHead = {};
      var groupHead = [];
      var allParents = reportObject.parentGroupProperty == undefined ? [{
        Title: 'N/A'
      }] : _.uniq(reportObject.reportData.map(function (reportDataEntry) {

        let computerName = reportObject.parentGroupProperty.split(' ').join('')
        if (reportDataEntry[computerName] != undefined) {
          reportDataEntry[reportObject.parentGroupProperty] = reportDataEntry[computerName];
        }
        return reportDataEntry[reportObject.parentGroupProperty];
      }));

      for (var i = 0; i < allParents.length; i++) {
        //TODO: push parent title here... : allParents[i] ONLY if reportObject.parentGroupProperty is defined

        var parentSum; // _.sumBy(dataForParent,reportObject.summingProperty);
        var dataForParent = reportObject.parentGroupProperty == undefined ? reportObject.reportData : _.filter(reportObject.reportData, function (o) {
          return o[reportObject.parentGroupProperty] == allParents[i];
        });
        if (reportObject.parentGroupProperty != undefined) {

          content.push({
            width: "*",
            bold: true,
            text: `${reportObject.parentGroupProperty} : ${allParents[i] == undefined ? ' N/A' : allParents[i]}`,
            margin: [5, 15, 2, 2]
          });
          //   parentSum =  _.sumBy(dataForParent,reportObject.summingProperty);
        }
        //  groupHead = reportObject.parentGroupProperty != undefined?[{width:"*", text: allParents[i]==undefined?'N/A':allParents[i],margin: [45, 2, 2, 2] }]:[""];
        //   var groupName = allParents[i]==undefined?'N/A':allParents[i];
        var allChidren = reportObject.childGroupProperty == undefined ? [{
          Title: 'N/A'
        }] : _.uniq(dataForParent.map(function (reportDataEntry) {
          let computerName = reportObject.childGroupProperty.split(' ').join('')
          if (reportDataEntry[computerName] != undefined) {
            reportDataEntry[reportObject.childGroupProperty] = reportDataEntry[computerName];
          }
          // return reportDataEntry[reportObject.parentGroupProperty];
          return reportDataEntry[reportObject.childGroupProperty];
        }));


        //  var childSum = _.sumBy(dataForChild,reportDataEntry.summingProperty);
        for (var j = 0; j < allChidren.length; j++) {
          var dataForChild = reportObject.childGroupProperty == undefined ? dataForParent : _.filter(dataForParent, function (o) {
            return o[reportObject.childGroupProperty] == allChidren[j];
          });
          //TODO: Push child title here...: allChidren[j] ONLY if reportObject.childGroupProperty is defined

          if (reportObject.childGroupProperty != undefined) {
            content.push({
              width: "*",
              bold: true,
              text: reportObject.childGroupProperty + ':  ' + (allChidren[j] == undefined ? ' N/A' : allChidren[j]),
              margin: [100, 2, 2, 2]
            });
            //   parentSum =  _.sumBy(dataForParent,reportObject.summingProperty);
          }

          content.push(buildtable({
            data: dataForChild,
            columns: reportObject.columns,
            width: reportObject.width,
            parentGroupProperty: reportObject.parentGroupProperty,
            parentGroupHead: allParents[i]
          }, marginData, noBorders,reportObject.fontSize));
          if (reportObject.childGroupProperty != undefined && reportObject.summingProperty != undefined) {
            content.push({
              width: "*",
              bold: true,
              margin: [5, 5, 20, 5],
              alignment: 'center',
              text: allChidren[j] + ' Total:  ' + (_.sumBy(dataForChild, reportObject.summingProperty)).toLocaleString(undefined, {
                maximumFractionDigits: 2
              })
            });
          }
        }

        if (reportObject.parentGroupProperty != undefined && reportObject.summingProperty != undefined) {
          var groupName = allParents[i] == undefined ? ' N/A' : allParents[i];
          content.push({
            width: "*",
            bold: true,
            margin: [5, 5, 20, 5],
            alignment: 'center',
            text: groupName + ' Total:  ' + (_.sumBy(dataForParent, reportObject.summingProperty)).toLocaleString(undefined, {
              maximumFractionDigits: 2
            })
          });
        }
      }

      //  var groupHead = {width:"*", text: departmentName==undefined?'N/A':departmentName,margin: [45, 2, 2, 2] };
      pdfContent.content = content;
      //    pdfContent.content.push(content);

      return pdfContent;
    }

    function toDataURL(src, callback, outputFormat) {

      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = 80;
        canvas.width = 80;
        ctx.scale(80 / this.naturalWidth, 80 / this.naturalHeight);

        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
      };
      img.src = src;
    }

    function buildReportHeader(reportTitle, lineSpanLength, logoMargin, titleMargin) {
      hospitalName = hospitalName || 'HOSPITAL_NAME';
      imageString = imageString || imageUrl;

      return [{
          table: {
            widths: ['auto', lineSpanLength - 60],
            bold: true,
            body: [
              [{
                  image: imageString 
                },
                {
                  stack: [{
                    alignment: 'center',
                    style: 'h1',
                    bold: true,
                    text: hospitalName,
                    margin: [-20, 13, 20, 0]
                  }]
                }
              ]
            ]
          },
          margin: logoMargin || [0, 5, 0, 0]
        },
        {
          canvas: [{
            type: 'line',
            x1: 0,
            y1: 5,
            x2: lineSpanLength,
            y2: 5,
            lineWidth: 1
          }],
          margin: titleMargin || [0, 5, 0, 0]
        },
        {
          alignment: 'center',
          style: 'header',
          bold: true,
          text: reportTitle,
          margin: [0, 8, 0, 0]
        },
        {
          canvas: [{
            type: 'line',
            x1: 0,
            y1: 5,
            x2: lineSpanLength,
            y2: 5,
            lineWidth: 1
          }],
          margin: titleMargin || [0, 5, 0, 0]
        }
      ];
    }

    function buildNewReportHeader(reportTitle, lineSpanLength, logoMargin, titleMargin) {
      hospitalName = hospitalName || 'HOSPITAL_NAME';
      imageString = imageString || imageUrl;

      return [{
          table: {
            widths: ['auto', lineSpanLength - 60],
            bold: true,
            body: [
              [{
                  image: imageString //'/src/app/ReportLogo/logo.png'
                },
                {
                  stack: [{
                    alignment: 'center',
                    style: 'h1',
                    bold: true,
                    text: hospitalName + '\n\n' + reportTitle,
                    margin: [0, 13, 0, 0]
                  }]
                }
              ]
            ]
          },
          margin: logoMargin || [0, 5, 0, 0]
        },
        {
          canvas: [{
            type: 'line',
            x1: 0,
            y1: 5,
            x2: lineSpanLength,
            y2: 5,
            lineWidth: 1
          }],
          margin: titleMargin || [0, 5, 0, 0]
        }
      ];
    }

    function BuildPDFText(text, style, alignment, margin, bold, fontSize,italics) {
      return {
        text: text,
        style: style,
        alignment: alignment,
        margin: margin,
        italics: italics||false,
        fontSize: fontSize || 14,
        bold: bold == null ? true : bold
      }
    }

    function buildtable(tableData, marginData, noBorders,fontSize,bold) {

      marginData = marginData || [0, 5, 0, 0];
      fontSize = fontSize || 11;
      for (var i = 0; i < tableData.data.length; i++) {
        return {
          columns: [
            {
              width: 'auto',
              fontSize: fontSize,
              margin: marginData,
              layout: noBorders != null ? 'noBorders' : null,
              bold:bold,
              table: {
                widths: tableData.width,
                headerRows: 1,
                fontSize: fontSize,
                bold:bold,
                body: buildTableBody(tableData.data, tableData.columns)
              }
            },
            {
              width: '*',
              text: '',
              bold: true
            }
          ]
        };
      }
    }

    function buildTableBody(data, columns) {
      var body = [];

      var newcols = columns.map(function (col) {

        let colText = col.split('|').length === 2 ? col.split('|')[0] : col.split('=').length === 2 ? col.split('=')[0] : col;

        col = {
          text: colText,
          bold: true
        }
        return col;
      });

      body.push(newcols);
      var count = 0;
      data.forEach(function (row) {
        row['S/N'] = String(++count);
        var dataRow = [];

        const originalRow = angular.fromJson(angular.toJson(row));

        columns.forEach(function (column) {

          const pipeSplit = column.split('|');
          const functionSplit = column.split('=');

          if(pipeSplit.length === 2 ){
            column = pipeSplit[1];
            let computerName = column.split(' ').join('')
            if (row[computerName] != undefined) {
              row[column] = row[computerName];
            }
          }

          else if(functionSplit.length==2){
            column = functionSplit[0].trim();
            let computerName = column.split(' ').join('')
            if (row[computerName] != undefined) {
              row[column] = row[computerName];
            }
            const operatorsSplit = functionSplit[1].split('&');
            
            if(operatorsSplit[0].trim() === 'CalculateDays'){
              if(operatorsSplit.length===3){
                row[column] = UtilityService.CalculateDays(originalRow[operatorsSplit[1].trim()], originalRow[operatorsSplit[2].trim()]);
              }
              else if(operatorsSplit.length===2){
                row[column] = UtilityService.CalculateDays(originalRow[operatorsSplit[1].trim()], new Date());
              }
            }
            else if(operatorsSplit[0].trim() === 'FormatDateTime'){
              row[column] = UtilityService.FormatDateTime(row[column]);
            }
          }
          else{
            let computerName = column.split(' ').join('')
            if (row[computerName] != undefined) {
              row[column] = row[computerName];
            }
            //row[column] =  UtilityService.dateTimeParse(row[column]);
          }

          if (row[column] == undefined) {
            row[column] = '';
          }
          
          dataRow.push(row[column].toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }));
        });
        body.push(dataRow);
      });
      return body;
    }

    function displayOrPrintPdf(dataurl) {
      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        const remote = require("electron").remote;

        const BrowserWindow = remote.BrowserWindow;

        var fs = require("fs");
        const PDFWindow = require('electron-pdf-window');
        const win = new BrowserWindow({
          width: 800,
          height: 600
        });

        var urlArr = dataurl.split("data:application/pdf;base64,");
        var newURl = urlArr[1];
        const path = require('path');
        const os = require('os');

        const homeDir = os.homedir();
        var appDataDir = path.join(homeDir, 'Hmis');

        if (!fs.existsSync(appDataDir)) {
          fs.mkdirSync(appDataDir);
        }

        appDataDir = path.join(appDataDir, 'message.pdf');

        fs.writeFile(appDataDir, new Buffer(newURl, "base64"),
          function (err) {
            if (err) {
              throw err;
            }

            PDFWindow.addSupport(win);
            win.loadURL(appDataDir);
          }
        );
      }
    }

    function viewCashierReport(cashierDetials, isDetailed) {
      StoreService.GetNewShiftDetailsUpdatedPlus(cashierDetials.ShiftNumber, isDetailed).then(function (result) {
        downLoadCashierReport(result, cashierDetials, isDetailed);
      });
    }

    function downLoadCashierReport(shift, cashierDetials, isDetailed) {
      var reportContent = {};
      reportContent.content = [];
      var serviceDepartments = [];
      var revenueDepartments = [];


      var shiftSummaryListing = [{
        Title: 'Total',
        Cash: _.sumBy(shift.Body, 'Cash'),
        Cheque: _.sumBy(shift.Body, 'Cheque'),
        POS: _.sumBy(shift.Body, 'POS'),
        EFT: _.sumBy(shift.Body, 'EFT'),
        'Mobile Money': _.sumBy(shift.Body, 'Mobile Money'),
        Total: _.sumBy(shift.Body, 'Cash') + _.sumBy(shift.Body, 'Cheque') + _.sumBy(shift.Body, 'POS') + _.sumBy(shift.Body, 'EFT') + _.sumBy(shift.Body, 'Mobile Money')
      }];

      var sortedItems = [];

      if (!isDetailed) {

        downloadCashierShiftSummarized(shift.Body, cashierDetials, shiftSummaryListing);
      } else if (isDetailed) {

        downloadCashierShiftDetailed(shift, cashierDetials, shiftSummaryListing);
      }
    }

    function downloadCashierShiftDetailed(newuniqShifts, cashierDetials, shiftSummaryListing) {

      var reportContent = {};
      reportContent.content = [];
      reportContent.pageMargins = [8, 30, 10, 30];
      const cashierLocation = newuniqShifts.Body[0].Location;
      var reportHeader = buildReportHeader(`DETAILED CASHIER SHIFT REPORT [${cashierDetials.CashierUsername}] [${cashierDetials.ShiftNumber}] @ [${cashierLocation}]` , 1170);

      reportContent.content = reportHeader;

      reportContent.footer = function (currentPage, pageCount) {
        return {
          table: {
            body: [
              [
                {
                  text: "Page " + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right',
                  style: 'normalText',
                  margin: [1050, 0, 0, 0]
                }
              ]
            ]
          },
          layout: 'noBorders'
        };
      };

      reportContent.content.push({
        margin: [0, 5, 0, 0],
        fontSize: 12,
        columns: [{
            text: 'Print Date:  ' + UtilityService.FormatDateTime(new Date()),
            alignment: 'left'
          },
          {
            text: 'Shift Date: ' + UtilityService.FormatDateTime(cashierDetials.selectedShiftDate),
            alignment: 'right'
          }
        ]
      })

      var nonGroupedContent = BuildPdfContent({
        reportData: newuniqShifts.Body,
        columns: ['S/N', 'Transaction Date=FormatDateTime', 'Receipt Number','Reference Number', 'Payer', 'Patient Number', 'Cash', 'Cheque', 'EFT', 'POS', 'Mobile Money', 'Total Amount'],
        width: [30, 107, 70, 165, 160, 75, 75, 75, 70, 75, 80, 80]
      });

      reportContent.content.push(nonGroupedContent.content);

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: shiftSummaryListing,
        columns: ['Title', 'Cash', 'Cheque', 'EFT', 'POS', 'Mobile Money', 'Total'],
        width: [627, 80, 80, 80, 80, 80, 80]
      });
      
      reportContent.content.push(nonGroupedContentSummary.content);

      var bodyText = BuildPDFText('COLLECTION SUMMARY BY SERVICE DEPARTMENT', 'header', 'left', [45, 20, 0, 20], true);
      reportContent.content.push(bodyText);

      var groupedContent = BuildPdfContent({
        reportData: newuniqShifts.Details,
        columns: ['Item', 'Cheque', 'Cash', 'EFT', 'POS', 'Mobile Money', 'Total Amount'],
        width: [627, 80, 80, 80, 80, 80, 80],
        parentGroupProperty: 'Service Department',
        summingProperty: 'Total Amount'
      });

      reportContent.content.push(groupedContent.content);

      reportContent.pageSize = 'A3';
      reportContent.pageOrientation = 'landscape';


      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }

    }

    function downloadCashierShiftSummarized(data, cashierDetials, shiftSummaryListing) {

      var reportContent = {};
      reportContent.content = [];

      reportContent.pageSize = 'A3';
      reportContent.pageOrientation = 'landscape';

      var reportHeader = buildReportHeader('Cashier Shift report [' + cashierDetials.CashierUsername + ' ] [' + cashierDetials.ShiftNumber + ']', 1110);

      reportContent.content = reportHeader;


      reportContent.content.push({
        margin: [0, 5, 0, 0],
        fontSize: 12,
        columns: [{
            text: 'Print Date:  ' + UtilityService.FormatDateTime(new Date()),
            alignment: 'left'
          },
          {
            text: 'Shift Date: ' + UtilityService.FormatDateTime(cashierDetials.selectedShiftDate),
            alignment: 'right'
          }
        ]
      });


      var rrrcontent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Revenue Department', 'Cash', 'Cheque', 'POS', 'EFT', 'Mobile Money', 'Cash+POS', 'Cash+Cheque', 'Total Amount'],
        width: [30, 191, 100, 100, 100, 100, 100, 100, 100, 100]
      });

      reportContent.content.push(rrrcontent.content);
      reportContent.content.push({
        table: {
          widths: ['*'],
          body: [
            [" "],
            [" "]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 0 : 0.5;
          },
          vLineWidth: function (i, node) {
            return 0;
          }
        }
      });

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: shiftSummaryListing,
        columns: ['Title', 'Cash', 'Cheque', 'EFT', 'POS', 'Mobile Money', 'Total'],
        width: [227, 100, 100, 100, 100, 100, 100]
      })
      reportContent.content.push(nonGroupedContentSummary.content);

      reportContent.pageSize = 'A3';
      reportContent.pageOrientation = 'landscape';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printNHISLetter(data) {
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('The Presidency', 570);
      reportContent.pageMargins = [8, 30, 0, 10];

      reportContent.content = reportHeader;

      reportContent.content.push(BuildPDFText(data.AddressLineTitle || '', 'header', 'left', [5, 10, 0, 0], false));
      reportContent.content.push(BuildPDFText(data.Scheme || '', 'header', 'left', [5, 0, 0, 0], false))
      reportContent.content.push(BuildPDFText(data.AddressLine1 || '', 'header', 'left', [5, 0, 0, 0], false))
      reportContent.content.push(BuildPDFText(data.AddressLine2 || '', 'header', 'left', [5, 0, 0, 0], false))
      reportContent.content.push(BuildPDFText(data.AddressLine3 || '', 'header', 'left', [5, 0, 0, 0], false))
      reportContent.content.push(BuildPDFText(data.AddressLine4 || '', 'header', 'left', [5, 0, 0, 10], false))

      reportContent.content.push(BuildPDFText(UtilityService.FormatDate(new Date()), 'header', 'left', [5, 5, 5, 10], false))

      reportContent.content.push({
        margin: [5, 5, 0, 0],
        columns: [{
          width: 'auto',
          text: 'Medical Bill for ' + data.BillMonth,
          alignment: 'left',
          decoration: 'underline',
          decorationColor: 'black'
        }]
      });

      reportContent.content.push(BuildPDFText('Attached are the details of your enrollee(s) who was/were seen under the secondary care in various specialties of our hospital. Their bill(s) is/are hereby forwarded to you for payment.', 'header', 'left', [5, 5, 5, 15], false));

      reportContent.content.push({
        columns: [
          // { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              headerRows: 1,
              fontSize: 10,
              widths: [20, 300, 100],
              body: [
                ['S/N', 'BILL TYPE', 'AMOUNT'],
                ['1.', 'FEE-FOR-SERVICE: INPATIENT', data.InPatientBill.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })],
                ['2.', 'FEE-FOR-SERVICE: OUTPATIENT SECONDARY BILLS', data.OutPatientBill.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })],
                ['3.', 'TOTAL', data.TotalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })]
              ]
            },
            margin: [50, 5, 30, 30],
            fontSize: 10
          },
          {
            width: '*',
            text: '',
            fontSize: 14
          }
        ]
      });


      reportContent.content.push(BuildPDFText(UtilityService.stringToWords(data.TotalAmount), 'header', 'left', [5, 5, 5, 20], false));

      reportContent.content.push(BuildPDFText('** In case of any cut or difference in the bills we are presenting and amount you are paying for any of the enrollees, kindly forward to us a copy of our/such bills indicating where you disagree with our billing.', 'header', 'left', [5, 5, 5, 50], false))
      const isPermanentAppointment = data.DfaIsPermanent;
      reportContent.content.push(BuildPDFText(data.DFA || '', 'header', 'left', [5, 5, 0, 0], false))
      reportContent.content.push(BuildPDFText(`${isPermanentAppointment?'':'Ag.'} Director Finance & Accounts`, 'header', 'left', [5, 5, 0, 0], false))
      reportContent.content.push(BuildPDFText('For: Chief Medical Director', 'header', 'left', [5, 5, 0, 20], false))

      reportContent.content.push(BuildPDFText('Prepared By: ' + data.PreparedBy, 'header', 'left', [5, 5, 0, 0], false))

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'potrait';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printAccountStatement(data, startDate, endDate, billType, partTitle,balanceColumn,title) {
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader(title, 570);
      reportContent.pageMargins = [8, 30, 0, 40];

      reportContent.content = reportHeader;

      reportContent.footer = function (currentPage, pageCount) {
        return {
          table: {
            body: [
              [{
                  width: 'auto',
                  text: 'Please note that this Statement of Account is based on transactions from ' + UtilityService.FormatDate(startDate) + " to " + UtilityService.FormatDate(endDate),
                  alignment: 'center',
                  decoration: 'underline',
                  decorationColor: 'black',
                  margin: [35, 0, 0, 0]
                }
               
              ]
            ]
          },
          layout: 'noBorders'
        };
      };

      var nonGroupedContent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Transaction Type', 'Debit Amount', 'Credit Amount', balanceColumn],
        width: [25, 200, 100, 100, 100]
      });
      reportContent.content.push(nonGroupedContent.content);

      const debitTotal = _.sumBy(data, 'DebitAmount');
      const creditTotal = _.sumBy(data, 'CreditAmount');
      let balance = creditTotal - debitTotal;

      balance = balance > 0 ? balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' CR' : (balance * -1).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' DB';

      reportContent.content.push({
        columns: [{
            width: '*',
            text: ''
          },
          {
            width: 'auto',
            table: {
              headerRows: 1,
              fontSize: 9,
              widths: [235, 100, 100, 100],
              body: [

                [{
                    text: 'Total',
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },
                  {
                    text: debitTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },
                  {
                    text: creditTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },
                  {
                    text: balance,
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  }
                ]

              ]
            },
            margin: [-15, 1, 2, 10],
            fontSize: 9
          },
          {
            width: '*',
            text: '',
            fontSize: 9
          }
        ]
      });

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'potrait';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printSchemePaymentReport(data, startDate, endDate, billType, partTitle) {
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('PAYMENT RECEIPTS FROM ' + UtilityService.FormatDate(startDate) + " TO " + UtilityService.FormatDate(endDate), 570);
      reportContent.pageMargins = [8, 30, 0, 40];

      reportContent.content = reportHeader;

      reportContent.footer = function (currentPage, pageCount) {
        return {
          table: {
            body: [
              [{
                  width: 'auto',
                  text: 'Please note that this Statement of Account is based on transactions from ' + UtilityService.FormatDate(startDate) + " to " + UtilityService.FormatDate(endDate),
                  alignment: 'center',
                  decoration: 'underline',
                  decorationColor: 'black',
                  margin: [35, 0, 0, 0]
                }
               
              ]
            ]
          },
          layout: 'noBorders'
        };
      };

      var nonGroupedContent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Date', 'Amount', 'Particulars', 'Reference Number','Receipt Number','Payment Mode'],
        width: [25,90,80,80, 80, 90, 63],parentGroupProperty: 'Hmo',summingProperty:'RawAmount'
      });
      reportContent.content.push(nonGroupedContent.content);

      reportContent.content.push({
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
              table: {
                headerRows: 1,
                fontSize: 9,
                  widths: [140,100],
                  body: [

                        [
                          { text: 'Grand Total', style: 'tableHeader',fontSize: 10,bold:true }, 
                          { text: _.sumBy(data,'RawAmount').toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}), style: 'tableHeader',fontSize: 10,bold:true}
                        ]
                      ]
                  }, margin: [50, 30, 2, 10] ,fontSize: 9
        },
        { width: '*', text: '',fontSize: 9 }
        ]
      }
    );

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'potrait';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printAccountStatementForAll(data, startDate, endDate, partTitle) {
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('SCHEDULE OF ' + partTitle + ' ACCOUNT POSITION AS AT ' + UtilityService.FormatDate(endDate) + "\n ALL ORGANIZATIONS ACCOUNT POSITION SUMMARY ", 570);
      reportContent.pageMargins = [8, 30, 0, 40];

      reportContent.content = reportHeader;

      reportContent.footer = function (currentPage, pageCount) {
        return {
          table: {
            body: [
              [{
                  width: 'auto',
                  text: 'Please note that this Statement of Account is based on transactions from ' + UtilityService.FormatDate(startDate) + " to " + UtilityService.FormatDate(endDate),
                  alignment: 'center',
                  decoration: 'underline',
                  decorationColor: 'black',
                  margin: [35, 0, 0, 0]
                }
                //{ text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'right', style: 'normalText',margin:[450,0,0,0] }
              ]
            ]
          },
          layout: 'noBorders'
        };
      };

      var nonGroupedContent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Name', 'TotalDebit', 'TotalCredit', 'Balance'],
        width: [25, 200, 100, 100, 100]
      });
      reportContent.content.push(nonGroupedContent.content);

      const debitTotal = _.sumBy(data, 'TotalDebit');
      const creditTotal = _.sumBy(data, 'TotalCredit');
      let balance = creditTotal - debitTotal;

      let shiftSummaryListing = [{
        Title: 'Total',
        'Total Debit': debitTotal,
        'Total Credit': creditTotal,
        'Total Balance': balance > 0 ? balance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' CR' : (balance * -1).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' DB'
      }];

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: shiftSummaryListing,
        columns: ['Total', 'Total Debit', 'Total Credit', 'Total Balance'],
        width: [233, 100, 100, 100]
      });

      reportContent.content.push(nonGroupedContentSummary.content);

      //   reportContent.content.push({
      //     margin: [5, 5, 0, 0],
      //     columns: []
      //   });

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'potrait';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printBillAdjustmentReport(data, startDate, endDate) {
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('Bill Adjustment Report ', 1173);
      reportContent.pageMargins = [8, 30, 8, 40];

      reportContent.content = reportHeader;

      reportContent.content.push({
        margin: [0, 5, 0, 0],
        fontSize: 8,
        columns: [{
            text: 'Print Date:  ' + UtilityService.FormatDateTime(new Date()),
            alignment: 'left'
          },
          {
            text: ' Between: ' + UtilityService.FormatDateTime(startDate).split(' ')[0] + ' and ' + UtilityService.FormatDateTime(endDate).split(' ')[0],
            alignment: 'right'
          }
        ]
      })

      reportContent.footer = function (currentPage, pageCount) {
        return {
          table: {
            body: [
              [{
                text: "Page " + currentPage.toString() + ' of ' + pageCount,
                alignment: 'right',
                style: 'normalText',
                margin: [450, 0, 0, 0]
              }]
            ]
          },
          layout: 'noBorders'
        };
      };

      var nonGroupedContent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Date', 'Service', 'Previous Quantity', 'Adjusted Quantity', 'Patient', 'Hospital Number', 'Adjustment Comment'],
        width: [25, 110, 317, 80, 80, 170, 80, 240],
        parentGroupProperty: 'Performed By'
      });
      reportContent.content.push(nonGroupedContent.content);

      //   reportContent.content.push({
      //     margin: [5, 5, 0, 0],
      //     columns: []
      //   });

      reportContent.pageSize = 'A3';
      reportContent.pageOrientation = 'landscape';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function downloadStockBalance(items, departmentName) {

      var reportContent = {};
      reportContent.content = [];
      var date = UtilityService.FormatDateTime(new Date());

      var reportHeader = buildReportHeader('Stock Balance Per Outlet Report for: ' + departmentName + ' as at ' + date, 1173);

      reportContent.content = reportHeader;
      reportContent.pageMargins = [8, 30, 0, 40];

      reportContent.footer = function (currentPage, pageCount) {
        return {
          table: {
            body: [
              [
                { text: "Page " + currentPage.toString() + ' of ' + pageCount, style: 'normalText',margin:[1000,0,0,35] }
              ]
            ]
          },
          layout: 'noBorders'
        };
      };

      var nonGroupedContent = BuildPdfContent({
        reportData: items,
        columns: ['S/N', 'Name', 'Brand Name','Formulation', 'Unit of Issue', 'Balance', 'Granular Qty', 'Cost Price', 'Stock Value','General Price','Nhis Price', 'Batch Number', 'Expiry Date'],
        width: [30, 310,100, 95, 50, 50, 50, 50, 80,50,50,  70, 70]
      });
      reportContent.content.push(nonGroupedContent.content);

      reportContent.content.push({
        width: "*",
        text: '  TOTAL:  ' + (_.sumBy(items, 'StockValue')).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        margin: [680, 5, 2, 2]
      });

      reportContent.pageSize = 'A3';
      reportContent.pageOrientation = 'landscape';
      $rootScope.processingRequest = false;
      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function viewStockBalance(outletId, stockType, departmentName, format) {
      StoreService.GetStockBalancePerOutlet(outletId, stockType).then(function (items) {
        if (items.length == 0) {
          UtilityService.showAlert('error', 'no record found');
          $rootScope.processingRequest = false;
          return;

        }
        if (format == 'EXCEL') {
          let date = UtilityService.FormatDateTime(new Date());
          UtilityService.exportToExcel('Stock Balance Per Outlet Report for: ' + departmentName + ' as at ' + date, items);
          $rootScope.processingRequest = false;
        } else {
          downloadStockBalance(items, departmentName);
        }
      });
    }

    function downloadRequisitionReport(data) {
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('Drug Requision Report', 820);

      reportContent.content = reportHeader;
      reportContent.pageMargins = [8, 30, 0, 10];

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'landscape';

      reportContent.content.push({
        columns: [{
          table: {
            widths: [400, 400],
            body: [
              [{
                text: 'Issuing Outlet :  ' + data.IssuingOutlet,
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Receiving Outlet:  ' + data.ReceivingOutlet,
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Date:   ' + UtilityService.FormatDate(data.Date),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Requisition Number:    ' + data.Number,
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      var nonGroupedContent = BuildPdfContent({
        reportData: data.Items,
        columns: ['S/N', 'Description', 'Strength', 'Unit Of Issue', 'Qty Requested', 'Qty Issued', 'Value'],
        width: [30, 360, 70, 65, 80, 60, 90]
      });

      reportContent.content.push(nonGroupedContent.content);

      reportContent.content.push({
        width: "*",
        text: '  TOTAL:  ' + data.TotalValue,
        margin: [685, 5, 2, 2]
      });

      reportContent.content.push({
        columns: [{
          table: {
            widths: [550],
            body: [
              [{
                text: 'Raised By:  ' + data.RequestingStaff,
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }],
              [{
                text: 'Signature: ___________________',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }]
            ]
          },
          layout: "noBorders",
          margin: [2, 50, 2, 10]
        }]
      });

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function downloadIssuanceReport(data, req) {
      var reportContent = {};
      reportContent.content = [];

      var date = UtilityService.FormatDateTime(new Date());

      var reportHeader = buildReportHeader('STOCK ISSUANCE VOUCHER', 820);

      reportContent.content = reportHeader;
      reportContent.pageMargins = [8, 30, 0, 10];

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'landscape';

      reportContent.content.push({
        columns: [{
          table: {
            widths: [400, 400],
            body: [
              [{
                text: 'Issuing Outlet :  ' + req.IssuingOutlet,
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Receiving Outlet:  ' + req.ReceivingOutlet,
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Date:   ' + UtilityService.FormatDate(req.Date),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Issuance Number:    ' + req.Number,
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      var nonGroupedContent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Description', 'Brand Name', 'Strength', 'Unit Of Issue', 'Cost Price', 'Qty', 'Value(₦) | Value'],
        width: [30, 328, 100, 70, 50, 60, 50, 60]
      });
      reportContent.content.push(nonGroupedContent.content);
      reportContent.content.push({
        width: "*",
        text: '  TOTAL:  ' + HmisConstants.naira + (_.sumBy(data, 'RawValue')).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        margin: [685, 5, 2, 2]
      });
      reportContent.content.push({
        columns: [{
          table: {
            widths: [400, 400],
            body: [
              [{
                text: 'Issuing Staff:  ' + req.IssuingStaff,
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Receiving Staff:    ___________________',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }],
              [{
                text: 'Signature: ___________________',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Signature:    ___________________',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }],
              [{
                text: 'Date: ___________________',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Date:    ___________________',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }]
            ]
          },
          layout: "noBorders",
          margin: [100, 10, 2, 100]
        }]
      });

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function downloadPatientGatePass(data, patient, wardStay) {
      var reportContent = {};
      reportContent.content = [];

      var date = UtilityService.FormatDateTime(new Date());

      var reportHeader = buildReportHeader('PATIENT GATE PASS', 575);

      reportContent.content = reportHeader;
      reportContent.pageMargins = [8, 30, 0, 10];

      reportContent.content.push({
        columns: [{
          table: {
            widths: [400, 400],
            body: [
              [{
                text: 'Folder No : ' + data.FolderNumber || ' ',
                style: 'tableHeader',
                margin: [2, 20, 2, 5]
              }, {
                text: 'Patient No:  ' + data.Number,
                style: 'tableHeader',
                margin: [2, 20, 2, 2]
              }],
              [{
                text: 'Patient Name :   ' + data.Surname + '  ' + data.OtherNames,
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Age:  ' + UtilityService.CalculateAge(data.DateOfBirth),
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Ward :   ' + ((data.Department!=null)||(data.Department!=undefined)?data.Department.Name:data.DepartmentName),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Gender:    ' + ((data.Gender!=null)||(data.Gender!=undefined)?data.Gender.Name:data.GenderName),
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Total Bill Amount :   ' + patient.totalbillAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Net Bill Amount:    ' + patient.netBillAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }),
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Admission Date :   ' + UtilityService.FormatDate((data.WardStayHistory!=null)||(data.WardStayHistory!=undefined)?(data.WardStayHistory.StartDate):data.EncounterStartDate),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Discharge Date:    ' + UtilityService.FormatDate(wardStay.DischargeDate),
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Discharge Status :   ' + wardStay.DischargeStatus,
                style: 'tableHeader',
                margin: [2, 5, 2, 40]
              }, {
                text: 'Discharge Status :   ' + wardStay.DischargeStatus,
                style: 'tableHeader',
                margin: [2, 5, 2, 40]
              }],

              [{
                text: 'Discharged By :  ' + wardStay.DischargedByName,
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Sign/CheckOut-Date :  ___________________ ',
                style: 'tableHeader',
                margin: [-60, 2, 5, 2]
              }],
              [{
                text: 'Nurse Manager :  ___________________  ',
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Sign/CheckOut-Date :   ___________________  ',
                style: 'tableHeader',
                margin: [-60, 2, 5, 2]
              }],
              [{
                text: 'Security Guard :  ___________________  ',
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Sign/CheckOut-Date :  ___________________   ',
                style: 'tableHeader',
                margin: [-60, 2, 5, 2]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'potrait';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function downloadHnBoxInvoice(data, invoiceData, summary,accountDetails) {

      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('HnBox Service Provider Invoice  Between: ' + UtilityService.FormatDateTime(invoiceData.StartDate).split(' ')[0] + ' and ' + UtilityService.FormatDateTime(invoiceData.EndDate).split(' ')[0], 518);

      reportContent.content = reportHeader;


      reportContent.content.push({
        margin: [0, 5, 0, 0],
        fontSize: 8,
        columns: [{
            text: 'Print Date:  ' + UtilityService.FormatDateTime(new Date()),
            alignment: 'left'
          },
          {
            text: ' Between: ' + UtilityService.FormatDateTime(invoiceData.StartDate).split(' ')[0] + ' and ' + UtilityService.FormatDateTime(invoiceData.EndDate).split(' ')[0],
            alignment: 'right'
          }
        ]
      })


      var groupedContent = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Item', 'Rate', 'Amount'],
        width: [20, 280, 40, 140]
      });

      reportContent.content.push(groupedContent.content);
      reportContent.content.push({
        table: {
          widths: ['*'],
          body: [
            [" "],
            [" "]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 0 : 0.5;
          },
          vLineWidth: function (i, node) {
            return 0;
          }
        }
      });

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: summary,
        columns: ['Total'],
        width: [370]
      })
      reportContent.content.push(nonGroupedContentSummary.content);


      reportContent.content.push({
        columns: [
          // { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              headerRows: 1,
              fontSize: 10,
              widths: [370],
              body: [
                ['Account Details'],
                [`Account Name:  ${accountDetails.ToAccountName}`],
                [`Naira Account Number:  ${accountDetails.ToAccountNumber}`],
                [`Bank:  ${accountDetails.ToBank}`]
              ]
            },
            margin: [0, 5, 30, 30],
            fontSize: 10
          },
          {
            width: '*',
            text: '',
            fontSize: 14
          }
        ]
      })


      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'potrait';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function downLoadGRNReport(items, totalCost) {

      var reportContent = {};
      reportContent.content = [];


      var reportHeader = buildReportHeader('Goods Received Note', 758);

      reportContent.content = reportHeader;

      reportContent.content.push({
        columns: [{
          table: {
            widths: [350, 350],
            body: [
              [{
                text: 'GRN Number :  ' + items[0].Number,
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Invoice Number:  ' + items[0].InvoiceNumber,
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Supply Date:   ' + UtilityService.FormatDateTime(items[0].Date),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Order Number: ' + items[0].OrderNumber,
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      var nonGroupedContent = BuildPdfContent({
        reportData: items,
        columns: ['S/N', 'Expiry Date', 'Batch Number','Description', 'Unit Of Issue', 'Qty Supplied', 'Rate', 'Amount'],
        width: [20, 80,60, 250, 60, 70, 60, 80]
      }, [2, 2, 2, 2]);
      reportContent.content.push(nonGroupedContent.content);



      reportContent.content.push({
        columns: [{
          table: {
            widths: [350, 350],
            body: [
              [{
                text: 'Total Supplied Value: ' + totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }]
            ]
          },
          layout: "noBorders",
          margin: [550, 5, 5, 5]
        }]
      });

      if(items[0].RelatedInformation){
        reportContent.content.push({
          columns: [{
            table: {
              widths: [350, 350],
              body: [
                [{
                  text: 'Related Information: ' + items[0].RelatedInformation
                }]
              ]
            },
            layout: "noBorders",
            margin: [2, 10, 5, 0]
          }]
        });
      }

      reportContent.content.push({
        table: {
          widths: ['*'],
          body: [
            [" "],
            [" "]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 0 : 0.5;
          },
          vLineWidth: function (i, node) {
            return 0;
          }
        }
      });

      reportContent.content.push({
        columns: [{
          table: {
            widths: [350, 350],
            body: [
              [
                {
                  text: 'Supplier Rep: ' + items[0].SupplierRep,
                  style: 'tableHeader',
                  margin: [2, 10, 2, 10]
                },{
                  text: 'Receiving Staff: ' + items[0].ReceivedBy,
                  alignment: 'right',
                  style: 'tableHeader',
                  margin: [2, 10, 2, 10]
                }

              ],
              [{
                text: 'Supplier: ' + items[0].SupplierName,
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Outlet Credited: ' + items[0].OutletName,
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }],
              ['', {
                text: 'Signature:    ___________________',
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'landscape';
      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function downLoadGoodReceivedNoteReport(data) {

      var reportContent = {};
      reportContent.content = [];


      var reportHeader = buildReportHeader('Goods Received Note', 758);

      reportContent.content = reportHeader;

      reportContent.content.push({
        columns: [{
          table: {
            widths: [350, 350],
            body: [
              [{
                text: 'GRN Number :  ' + data.Number,
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Invoice Number:  ' + data.InvoiceNumber,
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }],
              [{
                text: 'Supply Date:   ' + UtilityService.FormatDateTime(data.Date),
                style: 'tableHeader',
                margin: [2, 5, 2, 5]
              }, {
                text: 'Order Number: ' + data.OrderNumber,
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 2, 2, 2]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      var nonGroupedContent = BuildPdfContent({
        reportData: data.Items,
        columns: ['S/N', 'Item Code', 'Description', 'Unit Of Issue', 'Qty Supplied', 'Rate', 'Amount'],
        width: [20, 70, 330, 60, 70, 60, 80]
      }, [2, 2, 2, 2]);
      reportContent.content.push(nonGroupedContent.content);



      reportContent.content.push({
        columns: [{
          table: {
            widths: [350, 350],
            body: [
              [{
                text: 'Total Supplied Value: ' + data.TotalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }]
            ]
          },
          layout: "noBorders",
          margin: [550, 5, 5, 5]
        }]
      });

      if(data.RelatedInformation){
        reportContent.content.push({
          columns: [{
            table: {
              widths: [350, 350],
              body: [
                [{
                  text: 'Related Information: ' + data.RelatedInformation
                }]
              ]
            },
            layout: "noBorders",
            margin: [2, 10, 5, 0]
          }]
        });
      }

      reportContent.content.push({
        table: {
          widths: ['*'],
          body: [
            [" "],
            [" "]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 0 : 0.5;
          },
          vLineWidth: function (i, node) {
            return 0;
          }
        }
      });

      reportContent.content.push({
        columns: [{
          table: {
            widths: [350, 350],
            body: [
              [
                '',{
                  text: 'Receiving Staff: ' + data.ReceivedBy,
                  alignment: 'right',
                  style: 'tableHeader',
                  margin: [2, 10, 2, 10]
                }

              ],
              [{
                text: 'Supplier Rep: ' + data.SupplierRep,
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Outlet Credited: ' + data.OutletName,
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }],
              ['', {
                text: 'Signature:    ___________________',
                alignment: 'right',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'landscape';
      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printLabSampleLabelUpdated(items) {
      var reportContent = {};
      reportContent.content = [];
      for (var i = 0; i < items.length; i++) {
        reportContent.pageSize = { width: 220, height: 120 };
        items[i].PatientNumber = items[i].PatientNumber||'';
        items[i].PathNumber =  items[i].PathNumber ?` | ${items[i].PathNumber}`:'';
        items[i].SpecimenDate = items[i].SpecimenDate? ` | ${UtilityService.FormatDateTime(items[i].SpecimenDate)}` : '';

        reportContent.pageMargins = [25, 25, 0, 55];
          reportContent.content.push([{
            margin: [-25, 10, 10, 0],
            bold:true,
            fontSize:8,
            alignment: 'right',
            image: textToBase64Barcode(items[i].BarcodeNumber,40,1.5,true)
          },{
            margin: [-15, -100, 10, 0],
            bold:true,
            fontSize:10,
            alignment: 'center',
            text: `${items[i].PatientName}\n${items[i].PatientNumber}${items[i].PathNumber}${items[i].SpecimenDate}`}]);

        if (i + 1 < items.length) {
          reportContent.content.push({
            text: "",
            bold: true,
            pageBreak: "after"
          });
        }
      }
      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printLabSampleLabel(items,patientName,patientNumber,pathNumber) {

      var reportContent = {};
      reportContent.content = [];

      
      for (var i = 0; i < items.length; i++) {
        reportContent.pageSize = { width: 220, height: 120 };
     
        patientNumber = patientNumber||'';
        pathNumber =  pathNumber ?`| ${pathNumber}`:'';

        reportContent.pageMargins = [25, 25, 0, 55];
          reportContent.content.push([{
            margin: [-25, -5, 10, 0],
            bold:true,
            fontSize:8,
            alignment: 'right',
            image: textToBase64Barcode(items[i],40,1.5,true)
          },{
            margin: [-15, -100, 10, 0],
            bold:true,
            fontSize:14,
            alignment: 'right',
            text: `${patientName} | ${patientNumber}${pathNumber}`}]);

        if (i + 1 < items.length) {
          reportContent.content.push({
            text: "",
            bold: true,
            pageBreak: "after"
          });
        }
      }
      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false);
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function buildCustomTableBody(data, columns) {
      var body = [];
      var newcols = columns.map(function (col) {
        col = {
          text: col,
          bold: true,
          fillColor: '#f7f2ed'
        }
        return col;
      });

      body.push(newcols);

      data.forEach(function (row) {
        var dataRow = [];
        columns.forEach(function (column) {
          if (row[column] == undefined) {
            row[column] = '';
          }

          let computerName = column.split(' ').join('')
          if (row[computerName] != undefined) {
            row[column] = row[computerName];
          }

          if(column.toLowerCase().includes('date')){
            const tempDate = UtilityService.FormatDateTime(row[column.split(' ').join('')]);
            if(tempDate){
              row[column] = tempDate;
            }
          }

          dataRow.push(row[column].toString());
        });
        body.push(dataRow);
      });
      return body;
    }

    function table(data, columns, width, colSpan, margin,bold,myFontSize) {
      colSpan = colSpan != null ? colSpan : 2;
      margin = margin || [2, 2, 2, 2];
      bold = bold||false;
      for (var i = 0; i < data.length; i++) {
        return {
          fontSize: myFontSize||10,
          colSpan: colSpan,
          bold:bold,
          columns: [{
              width: '*',
              text: '',
              fontSize:myFontSize|| 10
            },
            {
              width: 'auto',
              fontSize: myFontSize||10,
              table: {
                fontSize: myFontSize||10,
                widths: width,
                headerRows: 1,
                colSpan: colSpan,
                bold : bold,
                body: buildCustomTableBody(data, columns)
              },
              margin: margin,
              layout: "lightHorizontalLines"
            },
            {
              width: '*',
              text: ''
            }
          ]
        };
      }
    }

    function downloadCompiledShiftReport(compilation,compiledBy) {
      $rootScope.processingRequest = false;
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader('SHIFT COMPILATION REPORT', 760);

      reportContent.content = reportHeader;


      reportContent.content.push([{
        margin: [0, 5, 0, 5],
        table: {
          widths: [265, 200, 268],
          body: [
            ['Print Date: ' + UtilityService.FormatDateTime(new Date()), 'Compilation Number: ' + UtilityService.FormatDateTime(compilation.ShiftBreakdown[0]['Compilation Number']), {
              text: 'Date Compiled: ' + UtilityService.FormatDateTime(compilation.ShiftBreakdown[0]['Date Compiled'])
            }]
          ]
        }
      }]);

      var nonGroupedContent = BuildPdfContent({
        reportData: compilation.ShiftBreakdown,
        columns: ['S/N', 'Cashier', 'Shift Number', 'Shift Date', 'Total Amount'],
        width: [30, 225, 120, 120, 220]
      });
      reportContent.content.push(nonGroupedContent.content);
      var total = _.sumBy(compilation.ShiftBreakdown, 'Total Amount');
      reportContent.content.push({
        columns: [{
            width: '*',
            text: ''
          },
          {
            width: 'auto',
            table: {
              headerRows: 1,
              fontSize: 9,
              widths: [522, 220],
              body: [

                [{
                  text: 'TOTAL',
                  style: 'tableHeader',
                  fontSize: 10,
                  bold: true
                }, {
                  text: total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }),
                  style: 'tableHeader',
                  fontSize: 10,
                  bold: true
                }]

              ]
            },
            margin: [0, 1, 2, 10],
            fontSize: 9
          },
          {
            width: '*',
            text: '',
            fontSize: 9
          }
        ]
      });

      reportContent.content.push({
        columns: [{
            width: '*',
            text: ''
          },
          {
            width: 'auto',
            table: {
              headerRows: 1,
              fontSize: 9,
              widths: [100,642],
              body: [

                [{
                  text: 'Total in words',
                  style: 'tableHeader',
                  fontSize: 10,
                  bold: true
                }, {
                  text: UtilityService.stringToWords(total),
                  style: 'tableHeader',
                  fontSize: 10,
                  bold: true
                }]

              ]
            },
            margin: [0, 1, 2, 10],
            fontSize: 9
          },
          {
            width: '*',
            text: '',
            fontSize: 9
          }
        ]
      });

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: compilation.RevenueBreakdown,
        columns: ['S/N', 'Revenue Department', 'Cash', 'POS', 'EFT', 'Mobile Money', 'Cheque', 'Total Amount'],
        width: [30, 158, 80, 80, 80, 80, 80, 100]
      });
      reportContent.content.push(nonGroupedContentSummary.content);

      reportContent.content.push({
        columns: [{
            width: '*',
            text: ''
          },
          {
            width: 'auto',
            table: {
              headerRows: 1,
              fontSize: 9,
              widths: [196, 80, 80, 80, 80, 80, 100],
              body: [

                [{
                    text: 'Total',
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  }, {
                    text: _.sumBy(compilation.RevenueBreakdown, 'Cash').toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },                  {
                    text: _.sumBy(compilation.RevenueBreakdown, 'POS').toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },                  {
                    text: _.sumBy(compilation.RevenueBreakdown, 'EFT').toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },                  {
                    text: _.sumBy(compilation.RevenueBreakdown, 'Mobile Money').toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },
                  {
                    text: _.sumBy(compilation.RevenueBreakdown, 'Cheque').toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  },
                  {
                    text: _.sumBy(compilation.RevenueBreakdown, 'Total Amount').toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }),
                    style: 'tableHeader',
                    fontSize: 10,
                    bold: true
                  }
                ]
              ]
            },
            margin: [0, 1, 2, 10],
            fontSize: 9
          },
          {
            width: '*',
            text: '',
            fontSize: 9
          }
        ]
      });

      reportContent.content.push({
        columns: [{
          table: {
            widths: [450, 280],
            body: [
              [{
                text: `Compiled By: ${compiledBy}`,
                style: 'tableHeader',
                margin: [2, 30, 2, 5],
                alignment: 'left'
              }, {
                text: 'Bank Rep: __________________________ ',
                alignment: 'center',
                style: 'tableHeader',
                margin: [2, 30, 2, 5]
              }],
              [{
                text: 'Sign: ________________________________ ',
                alignment: 'left',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Sign: _______________________________ ',
                alignment: 'center',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }],
              [{
                text: 'Date: ________________________________ ',
                alignment: 'left',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }, {
                text: 'Date: _______________________________ ',
                alignment: 'center',
                style: 'tableHeader',
                margin: [2, 10, 2, 10]
              }]
            ]
          },
          layout: "noBorders"
        }]
      });

      reportContent.pageSize = 'A4';
      reportContent.pageOrientation = 'landscape';

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }

    }

    function xrayResultView(data, isprovisional, result) {
      var reportContent = {};
      reportContent.content = [];
      var reportHeader = buildReportHeader((isprovisional ? "PROVISIONAL" : "") + ' RADIOLOGY REPORT FOR ' + data.Examination.toUpperCase(), 571);
      reportContent.pageMargins = [8, 30, 0, 55];
      reportContent.content = reportHeader;
      reportContent.pageSize = 'A4';

      reportContent.content.push([{
          //    alignment: 'justify',
          margin: [0, 5, 0, 0],
          fontSize: 8,
          columns: [{
              text: 'Patient:\t\t\t\t' + data.CustomerName,
              alignment: 'left'
            },
            {
              text: 'Number:  \t\t\t \t\t' + data.CustomerPhone,
              alignment: 'left'
            }
          ]
        },
        {
          //    alignment: 'justify',
          margin: [0, 5, 0, 0],
          fontSize: 8,
          columns: [{
              text: 'Sex:  \t\t\t\t\t' + data.Gender,
              alignment: 'left'
            },
            // {
            //     text: 'Number: ' +data[0].PatientNumber ,
            //     alignment:'center'
            // },
            {
              text: 'Age:  \t\t\t \t\t\t\t' + data.CustomerAge,
              alignment: 'left'
            }
          ]
        },
        {
          margin: [0, 5, 0, 0],
          fontSize: 8,
          columns: [{
              text: 'Request Date: \t' + UtilityService.FormatDateTime(data.RequestDate),
              alignment: 'left'
            },
            {
              text: 'Date Prepared:\t\t\t' + UtilityService.FormatDateTime(result.DatePrepared),
              alignment: 'left'
            }
          ]
        }, {
          //    alignment: 'justify',
          margin: [0, 5, 0, 0],
          fontSize: 8,
          columns: [{
              text: 'Ward/Clinic: \t   ' + (data.WardClinic),
              alignment: 'left'
            },
            // {
            //     text: 'Specimen: ' + data[0].Specimen,
            //     alignment: 'center'
            // },
            {
              text: 'Requesting Clinician:  ' + (data.RaisedBy != null ? (data.RaisedBy) : ""),
              alignment: 'left'
            }
          ]
        }, {
          margin: [0, 5, 0, 0],
          fontSize: 8,
          colSpan: 2,
          columns: [{
            text: 'Provisional Diagnosis: ' + (data.ProvisionalDiagnosis),
            alignment: 'left'
          }, '']
        }, {
          margin: [0, 5, 0, 0],
          fontSize: 8,
          colSpan: 2,
          columns: [{
            text: 'Clinical Summary: ' + (data.ClinicalSummary),
            alignment: 'left'
          }, '']
        }, {
          canvas: [{
            type: 'line',
            x1: 0,
            y1: 5,
            x2: 571,
            y2: 5,
            lineWidth: 1
          }],
          margin: [0, 5, 0, 5]
        }
      ]);

      reportContent.content.push([{
        table: {
          widths: [300, 270],
          fontSize: 10,
          body: [
            [{
                text: 'Film Size: ' + (result.FilmSize),
                alignment: 'left'
              },
              {
                text: 'Radiology Number: ' + result.NumberOfFilms,
                alignment: 'left'
              }
            ],
            [{
              text: [{
                  text: '\nNotes:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.Note
                }
              ],
              colSpan: 2
            }, {}],
            (result.Indication?[{
              text: [{
                  text: '\nIndication:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.Indication
                }
              ],
              colSpan: 2
            }, {}]:['','']),
            (result.PreviousStudy?[{
              text: [{
                  text: '\nPrevious Study:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.PreviousStudy
                }
              ],
              colSpan: 2
            }, {}]:['','']),
            (result.Technique?[{
              text: [{
                  text: '\nTechnique:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.Technique
                }
              ],
              colSpan: 2
            }, {}]:['','']),
            (result.Findings?[{
              text: [{
                  text: '\nFindings:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.Findings
                }
              ],
              colSpan: 2
            }, {}]:['','']),
            (result.Impression?[{
              text: [{
                  text: '\nImpression:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.Impression
                }
              ],
              colSpan: 2
            }, {}]:['','']),
            (result.Conclusion?[{
              text: [{
                  text: '\nConclusion:\n',
                  italics: true,
                  bold: true,
                  decoration: 'underline',
                  decorationColor: 'black'
                },
                {
                  text:'\t\t\t\t'+ result.Conclusion
                }
              ],
              colSpan: 2
            }, {}]:['',''])
          ]
        },
        layout: 'noBorders'
      }]);

      reportContent.content.push([{
        canvas: [{
          type: 'line',
          x1: 0,
          y1: 5,
          x2: 571,
          y2: 5,
          lineWidth: 1
        }],
        margin: [0, 5, 0, 5]
      }]);
      if (!isprovisional) {
        reportContent.content.push(
          {
            margin: [0, 10, 0, 0],
            columns: [{
              width: 'auto',
              fontSize: 8,
              text: 'Prepared By: ' + result.PreparedByName + '    ' + (result.DatePrepared != null ? UtilityService.FormatDateTime(result.DatePrepared) : ''),
              //alignment: 'centre',
              italics: true,
              bold: true,
              decoration: 'underline',
              decorationColor: 'black'
            }]
          },
          [{
            margin: [220, 20, 0, 0],
            columns: [{
              width: 'auto',
              fontSize: 8,
              text: 'Radiologist\'s Comment',
              alignment: 'centre',
              italics: true,
              bold: true,
              decoration: 'underline',
              decorationColor: 'black'
            }]
          },

          {
            //margin: [220, 10, 0, 0],
            columns: [{
              width: 'auto',
              fontSize: 8,
              text: result.VerifiersComment
              //alignment: 'centre',

            }]
          },
          {
            margin: [0, 10, 0, 0],
            columns: [{
              width: 'auto',
              fontSize: 8,
              text: 'Radiologist: ' + result.VerifiedByName + '    ' + (result.DateVerified != null ? UtilityService.FormatDateTime(result.DateVerified) : ''),
              //alignment: 'centre',
              italics: true,
              bold: true,
              decoration: 'underline',
              decorationColor: 'black'
            }]
          }
        ]);
      }

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }


    }

    function buildFluidBalanceEntry(fluidDetails){
      return [{
        table: {
          widths: [550, 560],

          body: [
            [{
              fillColor: '#cecece',
              fontSize: 10,
              colSpan: 2,
              noWrap: true,
              text: UtilityService.FormatDate(fluidDetails[0].DateRecorded),
              alignment: 'center'
            }, {}],
            [
              table(fluidDetails, ['Date Recorded', 'Entered By','Input Type', 'Blood', 'Tube', 'Oral', 'Iv','Total Intake','Balance','Total Output','Urine','Tube Vomit','Drain Faeces','Type'], 
              [120,70,70,60,60,60,60,70,70,70,70,70,70,80]),
              {}
            ],
            [
              {
                colSpan: 2,
                layout: "lightHorizontalLines",
                table: {
                  fontSize: 9,
                  widths: [120,70,70,60, 60, 60, 60, 70, 70, 70],
                  border:false,
                  body: [
    
                    [{
                        text: 'Total',
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      }, {
                        text: '',
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: '',
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: '',
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: '',
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: '',
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: _.sumBy(fluidDetails, 'TotalIntake').toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }),
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: _.sumBy(fluidDetails, 'Balance').toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }),
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      },
                      {
                        text: _.sumBy(fluidDetails, 'TotalOutput').toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }),
                        style: 'tableHeader',
                        fontSize: 10,
                        bold: true
                      }
                    ]
    
                  ]
                }
              }, 
              {}
            ]
          ]
        },
        margin: [0, 5, 0, 10]
      }]
    }

    function printClerkingDrugRequest(request){
      var reportContent = {};
      reportContent.content = [];
      var reportHeader = buildReportHeader("Patient Drug Request", 578);
      reportContent.pageMargins = [8, 30, 0, 55];
      reportContent.content = reportHeader;
      reportContent.pageSize = 'A4';

      var nameAndNumber = [
        { 'Patient Name': request.CustomerName, 'Patient Number': request.CustomerPhone }
      ];

      var sexAge = [
          { 'Sex': request.CustomerSex, 'Age': request.CustomerAge }
      ];

      reportContent.content.push([
        table(nameAndNumber, ['Patient Number', 'Patient Name'], [100, 220]),
        table(sexAge, ['Sex', 'Age'], [120, 200]),
      {
        margin: [0, 5, 0, 0],
        fontSize: 8,
        columns: [{
            text: 'Request Date: \t' + UtilityService.FormatDateTime(request.RequestDate),
            alignment: 'left'
          },
          {
            text: 'Requesting Clinician:  ' + (request.RaisedBy != null ? (request.RaisedBy) : ""),
            alignment: 'left'
          }
        ]
      }, {
        canvas: [{
          type: 'line',
          x1: 0,
          y1: 5,
          x2: 578,
          y2: 5,
          lineWidth: 1
        }],
        margin: [0, 5, 0, 5]
      }

      ]);
      var nonGroupedContent = BuildPdfContent({
        reportData: request.Drugs,
        columns: ['S/N', 'Name', 'Dosage', 'Frequency', 'Days','Formulation'],
        width: [25, 288, 40, 40, 30,100]
      });
      reportContent.content.push(nonGroupedContent.content);

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printSettlementSharing(data){
      var reportContent = {};
      reportContent.content = [];
      var reportHeader = buildReportHeader('SETTLEMENT SHARING SCOPE', 510);
      //reportContent.pageMargins = [8, 30, 0, 55];
      reportContent.content = reportHeader;
      reportContent.pageSize = 'A4';

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: data,
        columns: ['S/N', 'Fee Party', 'Percentage (%)|Percentage'],
        width: [30, 358, 95],parentGroupProperty:'Sharing Scope Value Name',summingProperty:'Percentage'
      });
      reportContent.content.push(nonGroupedContentSummary.content);

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }

    }

    function printRequestSlip(bill,outlet){
      var reportContent = {};
      reportContent.content = [];

      var reportHeader = buildReportHeader(`Doctor's Prescription`, 355,[-25, -25, 0, 0],[-25, 0, 0, 0]);

      reportContent.content = reportHeader;
      reportContent.pageSize = { width: 380, height: 'auto' };
      var nameAndNumber = [
        { 'Patient Name': bill.CustomerName, 'Patient Number': bill.CustomerNumber }
      ];

      var sexAge = [
          { 'Sex': bill.CustomerSex, 'Age': bill.CustomerAge }
      ];

      reportContent.content.push([
        table(nameAndNumber, ['Patient Number', 'Patient Name'], [100, 237],null,[-25, 5, 0, 0],null,12),
        table(sexAge, ['Sex', 'Age'], [137, 200],null,[-25, 5, 0, 0],null,12)
      ]);

      reportContent.content.push([
        table(bill.Drugs, ['Name', 'Dosage', 'Freq','Days'], [200, 40,35, 35],null,[-25, 5, 0, 0],null,12),
        {
          text: `Other Information: ${(bill.OtherInformation == null ? '' : (bill.OtherInformation))}`,
          italics: true,
          bold: true,
          fontSize:12,
          decorationColor: 'black',
          margin:[-25, 10, 0, 0]
        },
        {
          text: `Doctor's Name: ${(bill.RaisedBy == null ? '' : (bill.RaisedBy))}`,
          italics: true,
          bold: true,
          fontSize:12,
          decorationColor: 'black',
          margin:[-25, 10, 0, 0]
        },
        {
          text: `Date: ${UtilityService.FormatDateTime(bill.RequestDate)}`,
          italics: true,
          bold: true,
          fontSize:12,
          decorationColor: 'black',
          margin:[-25, 10, 0, 0]
        },
        {
          margin: [-25, 5, 0, 0],
          fontSize: 12,
          columns: [{
                  text: 'Pharmacy Outlet:  ' + outlet,
                  alignment:'left',
                  italics:true
              }]
          }
      ]);

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function(response){
          displayOrPrintPdf(response,true)
        });
      }
      else{
        pdfMake.createPdf(reportContent).open()
      }

    }

    function settlementFeePartyDetails(details){
      var reportContent = {};
      reportContent.content = [];
      var reportHeader = buildReportHeader("Settlement Fee Parties", 516);
      //reportContent.pageMargins = [8, 30, 0, 55];
      reportContent.content = reportHeader;
      reportContent.pageSize = 'A4';

      reportContent.content.push({
        margin: [0, 5, 0, 0],
        fontSize: 12,
        columns: [{
            text: 'Print Date:  ' + UtilityService.FormatDateTime(new Date()),
            alignment: 'left'
          },
          ''
        ]
      });

      var nonGroupedContentSummary = BuildPdfContent({
        reportData: details,
        columns: ['S/N', 'Name', 'Account Number', 'Bank Name', 'Bank Code'],
        width: [30, 200, 80, 80, 80]
      });
      reportContent.content.push(nonGroupedContentSummary.content);

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(reportContent).open();
      }
    }

    function printInvoiceSlip(entries,patient,invoiceNumber,paynow,paymentMode,revenueCode,channelSettingsActive){
      var reportContent = {};
      reportContent.content = [];
        var isCreditBill = paynow==true?'NO':'YES';
      var reportHeader = buildReportHeader( 'Patient Invoice Slip', 355,[-25, -25, 0, 0],[-25, 0, 0, 0]);

      reportContent.content = reportHeader;

      reportContent.watermark =  {text: '   INV', 
        color: 'red', fontSize:2, opacity: 0.05, bold: false, italics: false};

      reportContent.pageSize = { width: 380, height: 'auto' };

      var bodyText = BuildPDFText(patient.Name +' '+(patient.Age||'')+ ', '+ (patient.Number||''), 'header', 'center', [5, 5, 5, 5], true);
      reportContent.content.push(bodyText);

      var bodyText0 = BuildPDFText('Invoice Number: '+invoiceNumber, 'header', 'center', [5, 5, 5, 5], true);
      reportContent.content.push(bodyText0);

      reportContent.content.push(BuildPDFText('Is Credit Bill?: '+isCreditBill, 'header', 'center', [5, 5, 5, 5], true));

      var bodyText1 = BuildPDFText('Cost Date: '+UtilityService.FormatDate(new Date()), 'header', 'left', [5, 5, 5, 5], true);
      reportContent.content.push(bodyText1);

      var bodyText2 = BuildPDFText('Cost By: '+ $rootScope.globals.currentUser.Name, 'header', 'left', [5, 5, 5, 5], true);
      reportContent.content.push(bodyText2);

      if(channelSettingsActive && paymentMode ){
        var paymentModeText = BuildPDFText('Payment Channel: '+ paymentMode, 'header', 'left', [5, 5, 5, 5], true);
        reportContent.content.push(paymentModeText);
      }

      if(revenueCode!=null){
        var revenueCodeText = BuildPDFText('Revenue Code: '+ revenueCode, 'header', 'left', [5, 5, 5, 5], true);
        reportContent.content.push(revenueCodeText);
      }


      reportContent.content.push([
        { text: "NOTE: THIS IS NOT A PROOF OF PAYMENT ", italics:true, alignment: 'center', style: 'normalText', margin: [0, 20, 0, 0] }
      ]);

      reportContent.content.push([
        buildtable({data:entries,columns:['Name', 'Qty', 'Amount'],width:[180, 65, 80]}, [-25, 5, 0, 0],null,14,true), //['Name', 'Qty', 'Amount'], [180, 65, 80],14),
        {
          columns: [
             // { width: '*', text: '' },
              {
                  width: 'auto',
                  table: {
                      headerRows: 1,
                      fontSize: 14,
                      bold:true,
                      widths: [205, 130],
                      body: [
                          ['Total (N)', _.sumBy(entries,'GrandTotal').toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})],
                          ['Discount (N)', (_.sumBy(entries,'GrandTotal')-_.sumBy(entries,'NetAmount')).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})],
                          ['Please Pay (N)', (_.sumBy(entries,'NetAmount')).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})]
                      ]
                  },
                  margin: [-25, 5, 0, 0],
                  fontSize: 14,
                  bold:true
              },
              { width: '*', text: '', fontSize: 14 }
          ]
        }
      ]);

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(reportContent).getDataUrl(function(response){
          displayOrPrintPdf(response,true)
        });
      }
      else{
        pdfMake.createPdf(reportContent).open()
      }

    }


    function downloadLeaseInvoice(data){

      imageString = imageString || imageUrl;

      var headingText = `Kindly find below the cost of EQUIPMENT rent to you for your operations in ${data.InvoicePeriod}`;

      var noticeText = BuildPDFText(`[${headingText}]`, 'header', 'center', [5, 5, 5, 5], true,12,true);

      var invoiceEntries = BuildPdfContent({
        reportData: data.InvoiceEntries,
        columns: ['S/N','Asset Group', 'Asset Sub Group', 'Asset Description | Description', 'Asset Code|AssetCode','Asset Type', 'Down Time', 'Up Time', 'Rate Per Day (Naira)|LeaseCost', 'Amount'],
        width: [30,100,100, 280, 100,100, 80, 80, 80, 100]
      });
      const invoiceContent = invoiceEntries.content;

      var dd = {

        pageSize : 'A3',
        pageMargins : [25, 25, 10, 40],
        pageOrientation : 'landscape',

        defaultStyle : {
          fontSize  : 12,
          columnGap : 20
        },

        // Page Layout

        content : {

          // This table will contain ALL content
          table : {
            // Defining the top 2 rows as the "sticky" header rows
            headerRows: 2,
            // One column, full width
            widths: ['*'],
            body: [

              // Header Row One
              // An array with just one "cell"
            [{
            columns: [
              {
                image:imageString,
                //width: 150,
              },
              {
                stack: [{
                  alignment: 'center',
                  bold: true,
                  //color: 'yellow',
                  fontSize:50,
                  text: "Invoice",
                  margin: [-20, 13, 0, 0]
                }]
              },
              [
                {
                  text: 'web: www.nestoilgroup.com',
                  color: '#333333',
                  width: '*',
                  fontSize: 12,
                  bold: true,
                  alignment: 'right',
                  margin: [0, 0, 20, 15],
                },
                {
                  stack: [
                    {
                      columns: [
                        {
                          text: 'Bill To.',
                          color: '#aaaaab',
                          bold: true,
                          width: '*',
                          fontSize: 12,
                          alignment: 'right',
                        },
                        {
                          text: [
                            { text: 'THE PROJECT MANAGER\n', fontSize: 12 },
                            { text: `${data.Subsidiary}\n`, bold: true },
                            { text: data.Project, bold: true }
                          ],
                          bold: true,
                          color: '#333333',
                          fontSize: 12,
                          alignment: 'right',
                          width: 200,
                        },
                      ],
                    }
                  ],margin: [0, 0, 20, 15],
                },
              ],
            ],
          }],


              // Second Header Row

              [
                {
                  columns: [
                    {
                      width: 'auto',
                      margin: [0,0,10,0],
                      text: [
                        { text: 'Invoice #\n', fontSize: 12, bold: true, color: '#bbbbbb' },
                        { text: data.InvoiceNumber, fontSize: 12 }
                      ]
                    },
                    {
                      width: 'auto',
                      margin: [0,0,10,0],
                      text: [
                        { text: 'Date \n', fontSize: 12, bold: true, color: '#bbbbbb' },
                        { text: UtilityService.FormatDateTime(data.InvoiceDate), fontSize: 12 }
                      ]
                    },
                    {
                      width: 'auto',
                      margin: [0,0,10,0],
                      text: [
                        { text: 'Customer ID\n', fontSize: 12, bold: true, color: '#bbbbbb' },
                        { text: data.Project, fontSize: 12 }
                      ]
                    }
                  ]
                }
              ],

              // Now you can break your content out into the remaining rows.
              // Or you could have one row with one cell that contains
              // all of your content

              // Content Row(s)

              [noticeText],

              [invoiceContent],
              [{
                columns: [{
                    width: '*',
                    text: ''
                  },
                  {
                    width: 'auto',
                    table: {
                      headerRows: 1,
                      fontSize: 9,
                      widths: [30,100,100, 280, 100,100, 80, 80, 80, 100],
                      body: [
        
                        [{
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: '',
                            style: 'tableHeader',
                            fontSize: 10,
                            bold: true
                          },
                          {
                            text: 'Total: ',
                            style: 'tableHeader',
                            alignment:'right',
                            fontSize: 18,
                            bold: true
                          },
                          {
                            text: HmisConstants.naira+ (data.TotalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })),
                            style: 'tableHeader',
                            fontSize: 18,
                            bold: true
                          }
                        ]
        
                      ]
                    },
                    margin: [-22, 0, 0, 0],
                    fontSize: 9,
                    layout: 'noBorders'
                  },
                  {
                    width: '*',
                    text: '',
                    fontSize: 9
                  }
                ]
              }],
              [{canvas: [{ type: 'line', x1: 0, y1: 5, x2: 1140, y2: 5, lineWidth: 0.1 }]}],
              [BuildPDFText(`Total in words: ${UtilityService.stringToWords(data.TotalAmount)}`, 'header', 'left', [5, 5, 5, 5], false)],
              [{canvas: [{ type: 'line', x1: 0, y1: 5, x2: 1140, y2: 5, lineWidth: 0.1 }]}],
              [BuildPDFText(`[ PLEASE NOTE: During IDLE TIME, please return the Equipment to the ASSET DEPT to be used by other customers, if you do not want it to accrue undue cost against you.]`, 'header', 'center', [5, 5, 5, 5], true,12,true)],
              [{table: {
                headerRows: 1,
                widths: [ 80,1040],
                body: [
                  [
                    {
                      text: 'REMITTANCE',
                      fillColor: '#eaf2f5',
                      border: [false, true, false, true],
                      margin: [0, 5, 0, 5],
                      textTransform: 'uppercase',
                    },
                    {
                      text: '',
                      border: [false, true, false, true],
                      alignment: 'right',
                      fillColor: '#eaf2f5',
                      margin: [0, 5, 0, 5],
                      textTransform: 'uppercase',
                    },
                  ],
                  [
                    {
                      text: 'Subsidiary',
                      border: [false, false, false, true],
                      margin: [0, 5, 0, 5],
                      alignment: 'left',
                    },
                    {
                      border: [false, false, false, true],
                      text: data.Subsidiary,
                      fillColor: '#f5f5f5',
                      alignment: 'left',
                      margin: [0, 5, 0, 5],
                    },
                  ],
                  [
                    {
                      text: 'Customer ID',
                      border: [false, false, false, true],
                      margin: [0, 5, 0, 5],
                      alignment: 'left',
                    },
                    {
                      border: [false, false, false, true],
                      text: data.Project,
                      fillColor: '#f5f5f5',
                      alignment: 'left',
                      margin: [0, 5, 0, 5],
                    },
                  ],
                  [
                    {
                      text: 'Statement #',
                      border: [false, false, false, true],
                      margin: [0, 5, 0, 5],
                      alignment: 'left',
                    },
                    {
                      text: data.InvoiceNumber,
                      border: [false, false, false, true],
                      fillColor: '#f5f5f5',
                      alignment: 'left',
                      margin: [0, 5, 0, 5],
                    },
                  ],
                  [
                    {
                      text: 'Date',
                      border: [false, false, false, true],
                      margin: [0, 5, 0, 5],
                      alignment: 'left',
                    },
                    {
                      text: UtilityService.FormatDateTime(data.InvoiceDate),
                      border: [false, false, false, true],
                      fillColor: '#f5f5f5',
                      alignment: 'left',
                      margin: [0, 5, 0, 5],
                    },
                  ],
                ],
              }}]
            ]
          },


          // Table Styles

          layout: {
            hLineWidth: function(i, node) { return (i === 1 || i === 2) ? 1 : 0; },
            vLineWidth: function(i, node) { return 0; },
            hLineColor: function(i, node) { return (i === 1 || i === 2) ? '#eeeeee' : 'white'; },
            vLineColor: function(i, node) { return 'white' },
            paddingBottom: function(i, node) {
              switch (i) {
                case 0:
                  return 5;
                case 1:
                  return 2;
                default:
                  return 0;
              }
            },
            paddingTop: function(i, node) {
              switch (i) {
                case 0:
                  return 0;
                case 1:
                  return 2;
                default:
                  return 10;
              }
            }
          }
        },


        // Page Footer

        footer : function(currentPage, pageCount) {
          return {
            table: {
              body: [
                [
                  { text: 'Should you have any issue or concern on this invoice please contact the sender' , alignment: 'right', style: 'normalText', margin: [30, 0, 0, 0], fontSize: 12 },
                  { text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'right', fontSize: 12, style: 'normalText', margin: [150, 0, 0, 0] }
                ]
              ]
            },
            layout: 'noBorders'
          };
        },

      };

      if (typeof process !== "undefined" && process.release.name.search(/node|io.js/) !== -1) {
        pdfMake.createPdf(dd).getDataUrl(function (response) {
          displayOrPrintPdf(response, false)
        });
      } else {
        pdfMake.createPdf(dd).open();
      }

    }
  }
})();
