import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  colorCodes : string[]= [
    "#FF5733", "#E74C3C", "#2ECC71", "#F1C40F", "#FFC0CB",
    "#000000", "#3498DB", "#9B59B6", "#16A085", "#D35400",
    "#34495E", "#1ABC9C", "#8E44AD", "#F39C12", "#27AE60",
    "#C0392B", "#E67E22", "#2980B9", "#FDCB6E", "#9A12B3",
    "#FF9F1C", "#FF6B6B", "#FFEAA7", "#48C9B0", "#E74C3C",
    "#45B39D", "#D24D57", "#6A89CC", "#CF6A87", "#F4D03F",
    "#6C5CE7", "#FEAA91", "#EDBB99", "#4A90E2", "#FF4848",
    "#FF6348", "#7D3C98", "#A569BD", "#E5E7E9", "#5499C7",
    "#2E4053", "#BB8FCE", "#58D68D", "#E59866", "#82E0AA",
    "#F8C471", "#5499C7", "#D4AC0D", "#85C1E9", "#F0B27A"
  ];

  testdatapersons: any = {
    1: "A",
    2: "B",
    3: "C"
  }
  testdata1: any = {
    "description": "Rice",
    "amount": 500,
    "payers": [
        {
            "personId": "1",
            "amount": 500
        }
    ],
    "enrollers": [
        {
            "personId": "1",
            "amount": "166.67",
            "description": null
        },
        {
            "personId": "2",
            "amount": "166.67",
            "description": null
        },
        {
            "personId": "3",
            "amount": 166.66,
            "description": null
        }
    ],
    "image": null
  };
  testdata2: any = {
    "description": "Drinks",
    "amount": 300,
    "payers": [
        {
            "personId": "3",
            "amount": 200
        },
        {
            "personId": "2",
            "amount": 100
        }
    ],
    "enrollers": [
        {
            "personId": "1",
            "amount": "100.00",
            "description": null
        },
        {
            "personId": "2",
            "amount": "100.00",
            "description": null
        },
        {
            "personId": "3",
            "amount": "100.00",
            "description": null
        }
    ],
    "image": null
  };

  reportData: any[] = [];
  reportDataSummery: any[] = [];

  personIdCount: number = 1;
  persons: any = {};
  newPersonName: string = "";
  form: FormGroup;
  formMode: string = 'new';
  updatedIndex: number | undefined;

  constructor(private fb: FormBuilder){
    this.form = this.fb.group({
      description: ['', Validators.required],
      amount: ['', Validators.required],
      payers: this.fb.array([]),
      enrollers: this.fb.array([]),
      image: []
    })
    this.addNewFormPayer();
    this.addNewFormEnroller();
  }

  ngOnInit(): void {
    // this.setTestData();
  }

  setTestData(){
    this.persons = this.testdatapersons;
    this.setToReportData(this.testdata1);
    this.setToReportData(this.testdata2);
  }

  updateReportData(index: number){
    const data = this.reportData[index].data;
    this.resetFrom();
    this.formMode = 'update';
    this.updatedIndex = index;
    this.formDescription?.setValue(data.description);
    this.formAmount?.setValue(data.amount);
    for(let i=0;i<data.payers.length-1;i++){
      this.addNewFormPayer();
    }
    this.formPayers?.setValue(data.payers);
    for(let i=0;i<data.enrollers.length-1;i++){
      this.addNewFormEnroller();
    }
    this.formEnrollers?.setValue(data.enrollers);
    this.formImage?.setValue(data.image);
  }

  removeReportData(index: number){
    this.reportData.splice(index, 1);
    if(index === this.updatedIndex){
      this.updatedIndex = undefined;
      this.formMode = 'new';
    }
    this.setSummeryReportData();
  }

  setSummeryReportData(){
    const reportDataList = [...this.reportData];
    let dataSet1: any = {};
    let dataSet2: any = {};
    this.reportDataSummery = [];
    for (let reportRecord of reportDataList) {
      for (let key in reportRecord.details) {
        const keySplit = key.split('.');
        if(keySplit[0] == keySplit[2]){
          continue;
        }
        let value = {...reportRecord.details[key]};
        if(dataSet1.hasOwnProperty(key)){
          dataSet1[key].total = (+dataSet1[key].total) + (+value.total);
          dataSet1[key].description = [...dataSet1[key].description, ...value.description];
        }else{
          dataSet1[key] = value;
          dataSet1[key].status = 1;
        }
      }
    }
    for (let key in dataSet1) {
      let value = dataSet1[key];
      if(value.status == 1){
        const keySplit = key.split('.');
        const keySplitRevt = keySplit.slice().reverse();
        const revestKey = keySplitRevt.join('.');
        if(dataSet1.hasOwnProperty(revestKey) && dataSet1[revestKey].status == 1){
          if(+value.total >= +dataSet1[revestKey].total){
            dataSet2[key] = {...value};
            let amount = (+dataSet2[key].total) - (+dataSet1[revestKey].total);
            dataSet2[key].total = (Math.ceil(amount * 100) / 100).toFixed(2);
            dataSet2[key].rdescription = dataSet1[revestKey].description;
          }else{
            dataSet2[revestKey] = {...dataSet1[revestKey]};
            let amount = (+dataSet2[revestKey].total) - (+value.total);
            dataSet2[revestKey].total = (Math.ceil(amount * 100) / 100).toFixed(2);
            dataSet2[revestKey].rdescription = value.description;
          }
          dataSet1[revestKey].status = 0;
        }else{
          dataSet2[key] = {...value};
          dataSet2[key].rdescription = [];
        }
        value.status = 0;
      }
    }
    const sortedKeys = Object.keys(dataSet2).sort();
    sortedKeys.forEach(key => {
      this.reportDataSummery.push(dataSet2[key]);
    });
  }

  setToReportData(data: any, replaceIndex: number | undefined = undefined){
    const totalBillAmount: number = data.amount;
    const payers: any[] = data.payers;
    const enrollers: any[] = data.enrollers;
    let output: any = {
      data: data,
      details: {},
      payersCount: payers.length,
      enrollersCount: enrollers.length,
      rowCount: payers.length + enrollers.length + 2
    };

    for(let payer of payers){
      const payerWeight = payer.amount / totalBillAmount;
      for(let enroller of enrollers){
        const enrollerAmount = enroller.amount;
        const paymentToPayer = enrollerAmount * payerWeight;
        const roundedAmount = (Math.ceil(paymentToPayer * 100) / 100).toFixed(2);
        const key = `${enroller.personId}.should-pay-to.${payer.personId}`
        const description = `${data.description}/${enroller.description==null?'':enroller.description}/${this.persons[payer.personId]} payed ${roundedAmount} to ${this.persons[enroller.personId]}`;
        if(output.hasOwnProperty(key)){
          output.details[key].total += roundedAmount;
          output.details[key].description.push(description);
        }else{
          const detail = {
            total : roundedAmount,
            persons: {
              from: this.persons[enroller.personId], 
              to: this.persons[payer.personId],
              fromId: enroller.personId, 
              toId: payer.personId
            },
            description: [description]
          }
          output.details[key] = detail;
        }
      }
    }

    if(replaceIndex === undefined){
      this.reportData.push(output);
    }else{
      this.reportData[replaceIndex] = output;
    }
    this.setSummeryReportData();
  }

  get formDescription(){
    return this.form.get('description');
  }

  get formAmount(){
    return this.form.get('amount');
  }

  get formPayers() : FormArray{
    return this.form.get('payers') as FormArray;
  }

  get formEnrollers() : FormArray{
    return this.form.get('enrollers') as FormArray;
  }

  get formImage(){
    return this.form.get('image');
  }

  getformPayersPersonId(index: number){
    return this.formPayers.at(index).get('personId');
  }

  getFormPayersAmount(index: number){
    return this.formPayers.at(index).get('amount');
  }

  getformEnrollersPersonId(index: number){
    return this.formEnrollers.at(index).get('personId');
  }

  getFormEnrollersAmount(index: number){
    return this.formEnrollers.at(index).get('amount');
  }

  addNewFormPayer(){
    const newPayer: FormGroup = this.fb.group({
      personId: ['', Validators.required],
      amount: ['', Validators.required]
    });
    this.formPayers.push(newPayer);
  }

  removeFormPayer(index: number){
    this.formPayers.removeAt(index);
  }

  getFormPayerLength(): number {
    return this.formPayers.length;
  }

  addNewFormEnroller(){
    const newEnroller: FormGroup = this.fb.group({
      personId: ['', Validators.required],
      amount: ['', Validators.required],
      description: []
    });
    this.formEnrollers.push(newEnroller);
  }

  removeFormEnroller(index: number){
    this.formEnrollers.removeAt(index);
  }

  getFormEnrollerLength(): number {
    return this.formEnrollers.length;
  }

  addNewPerson(){
    if(this.newPersonName != "" && !Object.values(this.persons).includes(this.newPersonName)){
      this.persons[this.personIdCount] = this.newPersonName;
      this.personIdCount++;
      this.newPersonName = "";
    }
  }

  removePerson(personId: any){
    delete this.persons[personId];
  }

  saveFrom(){
    if(this.form.valid){
      if(!this.validateAmounts(this.form.value)){
        alert("Amount, Total payers amount, Total enrollers amount should be equeal!");
        return;
      }
      this.setToReportData(this.form.value);
      this.resetFrom();
    }else{
      alert("Please fill form correctly!");
    }
    console.log("save", this.form.value);
  }

  updateFrom(){
    console.log("update", this.form.value);
    if(this.form.valid){
      if(!this.validateAmounts(this.form.value)){
        alert("Amount, Total payers amount, Total enrollers amount should be equeal!");
        return;
      }
      this.setToReportData(this.form.value, this.updatedIndex);
      this.resetFrom();
    }else{
      alert("Please fill form correctly!");
    }
  }

  validateAmounts(data: any): boolean{
    const totalAmount: any = data.amount;
    let totalPayerAmount: any = 0;
    let totalEnrollersAmount: any = 0;
    for (let i=0;i<data.payers.length;i++){
      totalPayerAmount += (+data.payers[i].amount);
    }
    for (let i=0;i<data.enrollers.length;i++){
      totalEnrollersAmount += (+data.enrollers[i].amount);
    }
    console.log(totalAmount, totalPayerAmount, totalEnrollersAmount);
    return totalAmount.toFixed(2)==totalPayerAmount.toFixed(2) && totalPayerAmount.toFixed(2)==totalEnrollersAmount.toFixed(2);
  }

  resetFrom(){
    this.formMode = 'new';
    this.updatedIndex = undefined;
    this.formPayers.clear();
    this.formEnrollers.clear();
    this.addNewFormEnroller();
    this.addNewFormPayer();
    this.form.reset();
  }

  syncAmounts(){
    const totalValue = this.formAmount?.value;
    const totalEnrollerCount = this.getFormEnrollerLength();
    const onePersonAmount = totalValue / totalEnrollerCount;
    const roundedAmount = (Math.ceil(onePersonAmount * 100) / 100).toFixed(2);
    const minReduceAmount = +0.01;
    //Equalize enroller amounts 
    const misMatchAmountEnroller =  +(((+roundedAmount) * (+totalEnrollerCount)) - (+totalValue)).toFixed(2);
    let tempEnrollerAmount = 0;
    for(let index=0;index<totalEnrollerCount;index++){
      if(misMatchAmountEnroller > 0 && tempEnrollerAmount < misMatchAmountEnroller){
        this.getFormEnrollersAmount(index)?.setValue((+roundedAmount - +minReduceAmount).toFixed(2));
        tempEnrollerAmount += +minReduceAmount;
      }else{
        this.getFormEnrollersAmount(index)?.setValue(roundedAmount);
      }
    }
    const totalPayersCount = this.getFormPayerLength();
    const onePayerAmount = totalValue / totalPayersCount;
    const roundedPayerAmount = (Math.ceil(onePayerAmount * 100) / 100).toFixed(2);
    //Equalize payer amounts 
    const misMatchAmountPayer =  +(((+roundedPayerAmount) * (+totalPayersCount)) - (+totalValue)).toFixed(2);
    let tempPayerAmount = 0;
    for(let index=0;index<totalPayersCount;index++){
      if(misMatchAmountPayer > 0 && tempPayerAmount < misMatchAmountPayer){
        this.getFormPayersAmount(index)?.setValue((+roundedPayerAmount - +minReduceAmount).toFixed(2));
        tempPayerAmount += +minReduceAmount;
      }else{
        this.getFormPayersAmount(index)?.setValue(roundedPayerAmount);
      }
    }
  }

  personViceSyncAmounts(){
    this.formEnrollers.clear();
    let index = 0;
    for(let personId in this.persons){
      this.addNewFormEnroller();
      this.getformEnrollersPersonId(index)?.setValue(personId);
      index++;
    }
    this.syncAmounts();
  }

  downloadPdf(id: string) {
    const content = document.getElementById(id);
    if (!content) {
      console.error('Element not found!');
      return;
    }
    const elementsToHide = content.querySelectorAll('.rmcol');
    elementsToHide.forEach(element => {
      element.classList.add('hidden');
    });
    html2canvas(content).then((canvas) => {
      const elementsToHide = content.querySelectorAll('.rmcol');
      elementsToHide.forEach(element => {
        element.classList.remove('hidden');
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${new Date().getTime()}_bill.pdf`);
    });
  }

  arrayToString(array: string[]){
    return array.join(', ');
  }

  getReportDetailsMessage(detail: any){
    return `${detail.persons.from} should pay ${detail.total} to ${detail.persons.to} (${this.arrayToString(detail.description)})`;
  }


}
