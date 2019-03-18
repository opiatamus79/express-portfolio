import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, TypeService } from '../_services';
import { Router } from '@angular/router';
import { first, map } from 'rxjs/operators';
import { CustomerService } from '../_services';
import { NgAnalyzeModulesHost } from '@angular/compiler';
import { Observable } from 'rxjs/internal/Observable';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Chart } from 'chart.js';
import * as moment from 'moment'
import { getLocaleMonthNames } from '@angular/common';
import * as globals from '../globals.json';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public globals: any = globals.default;
  //@ViewChild('testChart') private testChart
  paymentDates: any;
  dueDates:any;
  user:any;
  dashboardInfo:any;
  userInfo:any;
  profileImg:string;
  currentBalance:string;
  cumulativeBalance: string;
  currentBillId:number;
  dueDate:string;
  payments:any;
  latestPayment:string;
  lastPaymentPeriod:string;
  accounts:any[]
  accountInfo = {
    serviceAddress:null
  }
  mockArray:any
  selectedAccount:any
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sept","Oct","Nov","Dec"]
  today = new Date().toLocaleDateString()
  bills:any
  graph_payments:any
  billsLength:string
  formattedBills:any[]
  billingChart:any
  billDates:any
  litersConsumed:any
  consumptionChart:any
  consumptionUpdate:string
  consumptionAverage:string
  paidAverage:string
  comparativeChart:any

  userInfoLoading:boolean = false
  infoLoading:boolean = false
  accountsLoading:boolean = false
  sixMosData_currentbalance: boolean =true;
  sixMosData_payments: boolean =true;
  sixMosData_waterUsage: boolean =true;
  sixMosData_comparitiveBill: boolean =true;
  sixMosData_cumulativeBill: boolean = true;

  constructor(
    private US: UserService, 
    private CS:CustomerService, 
    private TS:TypeService, 
    private router: Router, 
    private fb:FormBuilder
  ) { }

  ngOnInit() {
    this.getUser();
    this.getUserInfo(this.user.id);
    // this.getPayments(this.user.id);
    this.getAccounts(this.user.id);    
    
    //this.getBills(this.user.id);
    //this.showComparativeChart();
  }

  getUser(){
    this.user = JSON.parse(localStorage.getItem('current_user'));    
  }

  checkSixMosData(info: any){
      if(info.current_balance.bill_id == null)
        this.sixMosData_currentbalance = false;
      if(info.graph_data.payments == null)
        this.sixMosData_payments = false;
      if(info.graph_data.waterUsage_graph_data == null)
        this.sixMosData_waterUsage = false;
      if(info.graph_data.comparative_graph.prev_year == null && info.graph_data.comparative_graph.curr_year == null)
        this.sixMosData_comparitiveBill = false;
      if(!this.sixMosData_payments && !this.sixMosData_waterUsage && !this.sixMosData_currentbalance
        && !this.sixMosData_waterUsage){
        /*if(info.cumulative_balance.cumulative_total == null)
          this.sixMosData_cumulativeBill = false;*/
        return true;
      } else {
        return false;        
      }
  }

  getInfo(){
    this.infoLoading = true;
    this.CS.getDashboardInfo(this.user.id, this.selectedAccount.id).subscribe( info =>{
      console.log("info: ", info);
      var  noDataRetrived= this.checkSixMosData(info)
      if(noDataRetrived){
        this.formattedBills = [];
        //if(this.sixMosData_cumulativeBill)
        this.cumulativeBalance = this.selectedAccount.balance;
        this.infoLoading = false;
      } else {
        this.currentBillId = info.current_balance.bill_id;
        this.currentBalance = info.current_balance.amount;
        this.cumulativeBalance = this.selectedAccount.balance;
        this.graph_payments = info.graph_data.payments;
        this.dueDate = new Date(info.current_balance.due_date).toLocaleDateString()
        this.bills = info.graph_data.bill_graph_data
        this.billsLength = info.graph_data.bill_graph_data.length
        this.formattedBills = this.bills;
        this.paymentDates = this.getPaymentDates(this.bills)
        this.dueDates = this.getPaymentDueDates(this.bills)
        this.latestPayment = this.paymentDates[this.paymentDates.length - 1]
        this.lastPaymentPeriod = `${moment(info.current_balance.due_date).subtract(1, 'month').format("MM/DD/YYYY")} to ${moment(info.current_balance.due_date).format("MM/DD/YYYY")}`
        if(this.sixMosData_waterUsage)
          this.showConsumptionChart(info)
        if(this.sixMosData_payments)
          this.showBillingChart(this.bills,this.graph_payments);
        this.showComparativeChart(info.graph_data.comparative_graph);
        this.infoLoading = false;
        // $('.scrollable').slimscroll({ height: '900px' });
      }      
    });
  }

  getUserInfo(id){
    this.userInfoLoading = true;
    this.US.getInfoById(id).subscribe( userinfo =>{
      this.userInfoLoading = false;
      this.userInfo = userinfo;
      this.profileImg = userinfo.profile_image_url
    });
  }

  getPayments(id){
    this.CS.getCustomerPayments(id, "").subscribe( response =>{
      this.payments = response.body;
      this.paymentDates = this.getPaymentDates(response.body);
      this.latestPayment = this.paymentDates[this.paymentDates.length - 1]
    } )
  }

  getAccounts(id){
    this.accountsLoading = true;
    this.CS.getAllAccounts(id).subscribe(
      accounts =>{
        this.accounts = accounts
        this.selectedAccount = accounts[0]
        this.setAccount(this.accounts[0])
        this.getInfo();
      });
  }

  setAccount(account){
    this.accountsLoading = false;
    this.selectedAccount = account
    this.accountInfo.serviceAddress = account.service_address
  }

  onSelectAccount(){
    this.getInfo();
  }

  getPaymentDates(payments){
    var formattedDates = payments.map( payment => {
      var formatted
      formatted = new Date(payment.date_updated).toLocaleDateString()
      return formatted
    })
    return formattedDates
  }

  getPaymentDueDates(payments){
    var formattedDates = payments.map( payment => {
      var formatted
      formatted = new Date(payment.due_date).toLocaleDateString()
      return formatted
    })
    return formattedDates
  }

  getBills(id){
    this.CS.getBillsNoSearch(id).subscribe( data=>{
      this.bills = data
      this.formattedBills = this.bills.map(obj=>{
        var formatted = {}
        formatted = {
          ...obj,
          ...{
            paymentDateStatement:`${this.monthNames[new Date(obj.date_updated).getMonth()]} ${new Date(obj.date_updated).getDate()}, ${new Date(obj.date_updated).getFullYear()}`
          }
        }
        return formatted
      })
      this.paymentDates = this.getPaymentDates(this.bills)
      this.latestPayment = this.paymentDates[this.paymentDates.length - 1]
      this.lastPaymentPeriod = `${this.dueDates[this.dueDates.length - 2]} to ${this.dueDates[this.dueDates.length - 1]}`
      //this.showBillingChart(this.bills)
    })
  }

  getBillDates(bills){
    var formattedBills = bills.map( bill => {
      var formatted
      formatted = new Date(bill.date_updated).toLocaleDateString()
      return formatted
    })
    return formattedBills
  }

  formatBillDataBC(gbills: any[]){//formating Bill Data for Billing Chart
    return gbills.reduce((last, item) => {
          let month = this.monthNames[new Date(item.date_for_charges).getMonth()];
          return {
            months: !last.months.includes(month) ? [...last.months, month] : last.months,
            monthsSum: {
              ...last.monthsSum,
              [month]: last.monthsSum[month] ? last.monthsSum[month] + Number(item.amount) : Number(item.amount)
            }
          }
        }, { months: [], monthsSum: {} })
  }

  formatBillDataCC(gbills: any[]){//formating Bill Data for Customers Comparative Chart
    return gbills.reduce((last, item) => {
          let month = this.monthNames[new Date(item.date_for_charges).getMonth()];
          return {
            months: !last.months.includes(month) ? [...last.months, month] : last.months,
            monthsSum: {
              ...last.monthsSum,
              [month]: last.monthsSum[month] ? Number(item.amount) : Number(item.amount)
            }
          }
        }, { months: [], monthsSum: {} })
  }

  updateChartData(chart, data) {
     /* chart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
      });
      chart.data.datasets = data.datasets;
      chart.update();
      chart.data.labels = data.labels;
      chart.data.datasets.forEach((dataset) => {
          dataset.data.push(data);
      });*/

      chart.data.datasets = data.datasets;
      chart.data.labels = data.labels;
      chart.update();
  }
  generatePastSixMosString(){
    var months = [];
    for(var x = 6; x >= 0; x--){
        var d = new Date()
        d.setMonth(d.getMonth()-x);
        months.push(this.monthNames[d.getMonth()]);
    }
    return months;
  }
  
  showBillingChart(gbills:any[],gpayments:any[]){
    const average = arr => arr.reduce((sume, el) => sume + el, 0) / arr.length;    
    var organizedData = this.formatBillDataBC(gbills);

    var paymentsData = gpayments.reduce((last,item) => {
      let month = this.monthNames[new Date(item.date_created).getMonth()];
      return {
        months: !last.months.includes(month) ? [...last.months,month] : last.months,
        amountPerMonth : {
          ...last.amountPerMonth,
          [month] : last.amountPerMonth[month] ? last.amountPerMonth[month] + Number(item.amount) : Number(item.amount)
        }
      }
    }, {months: [], amountPerMonth : {} });

    let lastBillsIndex = this.monthNames.indexOf(organizedData.months[organizedData.months.length - 1]);
    let lastpaymentsIndex = this.monthNames.indexOf(paymentsData.months[paymentsData.months.length - 1]);


    let finalMonths = this.generatePastSixMosString();//lastBillsIndex < lastpaymentsIndex ? paymentsData.months : organizedData.months;

    console.log('FINAL Months ', finalMonths)

    var onlyAmounts = [];
    var monthAmounts = []
    let emptyAmounts = [null, null, null, null, null, null]
    var emptyMonths = ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']

    for (const i in finalMonths) {
      emptyAmounts.pop()
      emptyMonths.pop()
    }
    finalMonths = [...emptyMonths, ...finalMonths];
    for(const month in finalMonths){
      monthAmounts.push(organizedData.monthsSum[finalMonths[month]]);
      if(finalMonths[month] != 'N/A'){
        var value = organizedData.monthsSum[finalMonths[month]];
        if(value){
          console.log(organizedData.monthsSum[finalMonths[month]])
          onlyAmounts.push(organizedData.monthsSum[finalMonths[month]])
        }
      }
    }
    console.log('FINAL Months ', finalMonths)

    finalMonths = this.generatePastSixMosString(); //lastBillsIndex < lastpaymentsIndex ? paymentsData.months : organizedData.months;
    emptyMonths = ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']; 

    for(const i in finalMonths){
      emptyMonths.pop();
    }

    finalMonths = [...emptyMonths,...finalMonths];
    emptyAmounts = [null, null, null, null, null, null]
    emptyMonths = ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']
    let paymentAmount = [];

    for (const amount in finalMonths) {
      paymentAmount.push(paymentsData.amountPerMonth[finalMonths[amount]]);
    }

    this.paidAverage = `$${average(monthAmounts).toFixed(2)}`
    var billingAverage = average(onlyAmounts).toFixed(2)
    console.log(finalMonths)
    var billingAverageDataset = [billingAverage, billingAverage, billingAverage, billingAverage, billingAverage, billingAverage]
    var chartData = {
          labels: finalMonths,
          datasets: [
            {
              label: "Charges",
              backgroundColor: 'rgb(64, 164, 223)',
              borderColor: 'rgb(51, 122, 183)',
              data: monthAmounts,
            },
            {
              label: "Payments",
              backgroundColor: 'rgb(51, 122, 183)',
              borderColor: 'rgb(51, 122, 183)',
              data: paymentAmount,
            },
            {
              /*[average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2), average([378, 358, 411, 402, 368, 434]).toFixed(2)]*/
              type: 'line',
              label: `Avg. - $${billingAverage}`,
              data: billingAverageDataset,
              fill: false,
              borderWidth: 1,
              borderColor: '#000000',
              borderDash: [5,4],
              lineTension: 0,
              steppedLine: true
            }
          ]
        };

    if(this.billingChart) {
      this.updateChartData(this.billingChart, chartData)
    } else {
      this.billingChart = new Chart('billingChart', {
        type: 'bar',
        data: chartData
        ,
        options: {
          legend : {
            position : 'bottom',
            labels : {
              boxWidth : 18,
              fontSize : 11
            }
          },
          responsive:true,
          maintainAspectRatio: false,
          tooltips: {
            callbacks: {
              label: (item, data) => {
                var datasetIndex = item.datasetIndex
                var datasetName = data.datasets[datasetIndex].label
                return `${datasetName}: $${item.yLabel}`
              },
            },
            position:'nearest'
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: function(label, index, labels) {
                  return '$'+label;
                },
                beginAtZero:true,
                autoSkip: false
              }
            }],
            xAxes: [{
              ticks: {
                beginAtZero:true,
                autoSkip: false
              }
            }]
          },
          elements:{
            point:{ radius:0 }
          }
        }
      })
    }
  }

  showConsumptionChart(gdata){
    const average = arr => arr.reduce((sume, el) => parseFloat(sume) + parseFloat(el), 0) / arr.length;
    var organized = gdata.graph_data.waterUsage_graph_data.past_six_months.reduce((last, item) => {
      let month = this.monthNames[item.month];
      return {
        months: !last.months.includes(month) ? [...last.months, month] : last.months,
        monthsSum: {
          ...last.monthsSum,
          [month]: last.monthsSum[month] ? last.monthsSum[month] + Number(item.amount) : Number(item.amount)
        }
      }
    }, { months: [], monthsSum: [] })

    var amounts = []
    for (const usage in gdata.graph_data.waterUsage_graph_data.past_six_months) {
      amounts.push(gdata.graph_data.waterUsage_graph_data.past_six_months[usage].amount)
    }

    this.consumptionAverage = `${average(amounts).toFixed(0)} Gallons`
    var chartData ={
        labels: organized.months,
        datasets: [{
          label: "Water usage (Gal)",
          backgroundColor: 'rgb(64, 164, 223)',
          borderColor: 'rgb(51, 122, 183)',
          data: amounts,
        }]
      };

    if(this.consumptionChart)
      this.updateChartData(this.consumptionChart, chartData);

    this.consumptionChart = new Chart('consumptionChart', {
      type: 'line',
      data: chartData,
      options: {
        responsive:true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
              autoSkip: false
            }
          }],
          xAxes: [{
            ticks: {
              beginAtZero:true,
              autoSkip: false
            }
          }]
        }
      }
    })
  }

  getValidMonths(monthData: any[]){
    var counter = 0;
    var finalMonths = this.monthNames.map(function(data, month) {
      if(monthData[counter] != null && monthData[counter] == data){
        counter++;
        return data;
      }
      else
        return 'N/A'
    });
    return finalMonths;
  }

  getValidBillData(prevYearBillsData: any, currYearBillsData: any){
    var currYearData = [];
    var prevYearData = [];

    this.monthNames.forEach(month => {
      if(currYearBillsData.monthsSum[month])
        currYearData.push(currYearBillsData.monthsSum[month])
      else
        currYearData.push(null);
      if(prevYearBillsData.monthsSum[month])
        prevYearData.push(prevYearBillsData.monthsSum[month])
      else
        prevYearData.push(null);
    });
    return {"currYrData": currYearData, "prevYrData": prevYearData};
  }

  arraySize(arr: any[]){
    var counter = 0;
    arr.forEach(x =>{
      if(x)
        counter++;
    })
    return counter;
  }

  showComparativeChart(gdata){
    const average = arr => arr.reduce((sume, el) => sume + el, 0) / this.arraySize(arr);
    const currYearBillsData = this.formatBillDataCC(gdata.curr_year);
    const prevYearBillsData = this.formatBillDataCC(gdata.prev_year);
    let validMos_currYear = this.getValidMonths(currYearBillsData.months);
    let validMos_prevYear = this.getValidMonths(prevYearBillsData.months);

    const validBillData = this.getValidBillData(prevYearBillsData, currYearBillsData);

    var sampleData1 = validBillData.prevYrData;//[378, 358, 411, 402, 368, 434, 422, 401, 388, 400, 350, 380]
    var sampleData2 = validBillData.currYrData;//[389, 364, 401, 426, 399, 401, 430, 420, 416, 385, 379, 395]

    var billingAverage1 = average(sampleData1).toFixed(2)
    var billingAverageDataset1 = [billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1, billingAverage1]

    var billingAverage2 = average(sampleData2).toFixed(2)
    var billingAverageDataset2 = [billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2, billingAverage2]
    var validMonthNames = this.monthNames.map(function(data, month) {
        if(validMos_currYear[month] != 'N/A' || validMos_prevYear[month] != 'N/A')
          return data;
        else
          return 'N/A';

    })
    var chartData = {
          labels: this.monthNames,
          datasets: [
            {
              label: "Prev",
              backgroundColor: '#da3636',
              borderColor: '#da3636',
              data: sampleData1,
            },
            {
              label: "Curr",
              backgroundColor: '#3ca730',
              borderColor: '#3ca730',
              data: sampleData2,
            },
            {
              type: 'line',
              label: `Prev ${billingAverage1}`,
              data: billingAverageDataset1,
              fill: false,
              borderWidth: 1,
              borderColor: '#da3636',
              borderDash: [5,4],
              lineTension: 0,
              steppedLine: true,
            },
            {
              type: 'line',
              label: `Curr ${billingAverage2}`,
              data: billingAverageDataset2,
              fill: false,
              borderWidth: 1,
              borderColor: '#3ca730',
              borderDash: [5,4],
              lineTension: 0,
              steppedLine: true
            }
          ]
        };

    if(this.comparativeChart){
      this.updateChartData(this.comparativeChart, chartData)
    }
    else{
      this.comparativeChart = new Chart('comparativeChart', {

        type: 'bar',
        data: chartData,
        options: {
          legend : {
            position : 'bottom',
            labels : {
              boxWidth : 12,
              fontSize : 9,
              padding: 5
            }
          },
          responsive:true,
          tooltips: {
            callbacks: {
              //label: (item, data) => ` ${item.xLabel}`,

              afterLabel: (item, data) => {
                //console.log('aaaaaaaaaaaaaaaaa',item, data)
                var datasetIndex = item.datasetIndex
                var datasetName = data.datasets[datasetIndex].label
                return `Previous Average: ${billingAverage1} USD\nCurrent Average: ${billingAverage2} USD`

              }

            },
            position:'nearest'
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: function(label, index, labels) {
                  return label+' USD';
                },
                beginAtZero:true,
                autoSkip: false
              }
            }],
            xAxes: [{
              ticks: {
                beginAtZero:true,
                autoSkip: false
              }
            }]
          },
          elements:{
            point:{ radius:0 }
          }
        }
      })    
    }
  }

}

