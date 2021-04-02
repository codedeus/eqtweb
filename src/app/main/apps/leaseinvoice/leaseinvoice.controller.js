(function(){
    'use strict';

    angular.module('app.leaseInvoice').
      controller('LeaseInvoiceController',function(ReportBuilderService, StoreService,UtilityService){
        var vm = this;
        vm.invoices = [];

        vm.SearchForLeaseNumber = function (searchText) {
            if (searchText != undefined) {
              return StoreService.SearchForLeaseNumber(searchText).then(
                function (items) {
                  console.log(items);
                  return items;
                });
            }
        };

        const GetLeaseInvoices=(leaseId)=>StoreService.GetLeaseInvoices(leaseId).then((res)=>vm.invoices = res);

        vm.selectedLeaseNumberChange =(lease)=>{
          if(lease){
            GetLeaseInvoices(lease.Id);
          }
        }

        vm.openDetailsForm = (ev,invoice)=>{
          if(invoice && invoice.Id){
            StoreService.GetInvoiceDetail(invoice.Id).then((res)=>{
              if(res){
                UtilityService.showDialog(ev, 'invoicedetail.html',res,'InvoiceDetailController').then((res)=>{
                  //UtilityService.showAlert('success','updated successfully')
                });
              }
            })
          }
        }

        vm.printInvoice = (ev,invoice)=>{
          if(invoice && invoice.Id){
            console.log(invoice)
            StoreService.GetInvoiceDetail(invoice.Id).then((res)=>{
              if(res){
                ReportBuilderService.downloadLeaseInvoice(res);
              }
            })
          }
        }

        vm.openInvoiceForm = (ev)=>{
          if(vm.selectedLease){
            const invoiceDetail = {
              Project:vm.selectedLease.Project,
              Location:vm.selectedLease.Location,
              AssetLeaseId:vm.selectedLease.Id
            }
            UtilityService.showDialog(ev, 'newinvoice.html',invoiceDetail,'NewInvoiceController').then((res)=>{
              UtilityService.showMessage('success',`invoice number: ${res}`);
              GetLeaseInvoices(vm.selectedLease.Id)
            });
          }
        }
    }).controller('InvoiceDetailController',function(dialogData, $mdDialog, UtilityService, StoreService){
      var vm = this;
      vm.invoiceDetail = dialogData;

      vm.closeDialog = function () {
        $mdDialog.cancel();
      };

      vm.cancel = function () {
          $mdDialog.cancel();
      };
    }).controller('NewInvoiceController',function(dialogData, $mdDialog, UtilityService, StoreService,ReportBuilderService){
      var vm = this;
      vm.monthFormat =  UtilityService.buildLocaleProvider("MMMM-YYYY");
      vm.invoiceDetail = dialogData;

      vm.GetInvoiceDetails = ()=>{
        if(vm.invoiceDetail.SelectedMonth){
          const startDate = vm.invoiceDetail.SelectedMonth;
          const endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0,  23, 59, 59, 59);
          StoreService.GetLeaseDetailsForInvoicing(vm.invoiceDetail.AssetLeaseId,startDate,endDate).then((res)=>{
            if(res && res.length>0){
              vm.invoiceDetail.InvoiceEntries = res;
            }
          })
        }
      }

      vm.closeDialog = function () {
        $mdDialog.cancel();
      };

      vm.submit = () =>{
        if(vm.invoiceDetail.SelectedMonth && vm.invoiceDetail.InvoiceEntries.length>0){
          const startDate = vm.invoiceDetail.SelectedMonth;
          const endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0,  23, 59, 59, 59);
          const payload = {
            UpdateStartDate:startDate,
            UpdateEndDate:endDate,
            AssetLeaseId:vm.invoiceDetail.AssetLeaseId,
            InvoicePeriod:vm.invoiceDetail.SelectedMonth.toLocaleString('en-us',{month:"long"})+", " +vm.invoiceDetail.SelectedMonth.getFullYear(),
            TotalAmount: _.sumBy(vm.invoiceDetail.InvoiceEntries, ((entry)=>entry.LeaseCost * entry.UpTime))
          }

          StoreService.CreateInvoice(payload).then((res)=>{
            vm.invoiceDetail = {};
            ReportBuilderService.downloadLeaseInvoice(res);
            $mdDialog.hide(res.InvoiceNumber);
          })
        }
      }
    });
})();