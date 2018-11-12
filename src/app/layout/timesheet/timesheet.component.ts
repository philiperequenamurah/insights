import { Component, OnInit } from '@angular/core';
import {  } from '@angular/common';
import { routerTransition } from '../../router.animations';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {EventEmitterService} from '../../service/emitter/event-emmiter-service';  
import {MantisService} from '../../service/mantis/mantis-service';  
import {RunrunService} from '../../service/runrun/runrun-service'
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-timesheet',
    templateUrl: './timesheet.component.html',
    styleUrls: ['./timesheet.component.scss'],
    animations: [routerTransition()]
})
export class TimesheetComponent implements OnInit {
    public myDate = {time: new Date()};
    public lastTime = {time: new Date()};
    private sortBy = 0;
    public listResult: Array<any> = [];
    public options : Array<any> = [
        {label:"Usuario", key:"user_name", group: "user_id"},
        {label:"Cliente", key:"client_name", group: "client_id"},
        {label:"Projeto", key:"project_name", group: "project_id"},
        {label:"Tipo Atividade", key:"type_name", group: "type_id"},
        {label:"Data", key:"date", group:"date"}];

    public optionsNotUsed : Array<any> = [];

    public filtro = { dateStart : null, dateEnd: null, orderOptions : this.getClone(this.options)};

    private requestQuery = {
        period_start:"2018-10-01",
        period_end:"2018-10-31",
        include_capacity:true,
        include_untracked:true,
        group_by:"",
        period_type:"custom_range" 
    };
    public weekDay: Array<String> =[
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado"
    ];

    constructor(private glpiService: GlpiService, private mantisService: MantisService,  private route: ActivatedRoute,
    private router: Router, private runrunService: RunrunService) { }

    ngOnInit() { 
        if(localStorage.getItem('timesheetfiltro'))
            this.filtro = JSON.parse(localStorage.getItem('timesheetfiltro'));
        this.redefineOptionsVisible();
        this.resetData();
        // EventEmitterService.get('glpi').subscribe(data => this.resetGlpi());
        setInterval(() => {
	        this.resetData();
        }, 10 * 1000 * 60);
	}

    public resetData(){
        if(localStorage.getItem('timesheetfiltro'))
            this.filtro = JSON.parse(localStorage.getItem('timesheetfiltro'));
        var reqQuery = [];
        this.filtro.orderOptions.forEach(function(value:any){
            reqQuery.push(value.group)
        });
        
        this.requestQuery.group_by = reqQuery.toString();

        this.runrunService.getTimesheet(this.requestQuery)
        .subscribe(data=> {
            this.montarData(data);
        });
    }
    private getClient(label: any){
        var client = null;

    }

    private montarData(data: any){
        var dataJson = JSON.parse(data);
        var listaInterna = this.listResult;
        listaInterna.length = 0;
        dataJson.result.forEach(function(value: any){
            listaInterna.push(value);
        })
            
    }

    public resetMantis(){
        // this.mantisService.getMantis().subscribe(data => {
        //    this.montarData('mantis',data);
        // });
    }

    public utcTimeStart() {
        this.myDate.time = new Date();
    }

    public getCssMantis(qtd: any){}

    public countMantis(dd: any){
        return (+dd.crash) + (+dd.block) + (+dd.major) + (+dd.other);
    }
    public getCssGLPI(glpi: any){
        if(glpi.vencido > 0)
            return 'red';
        if(glpi.vincendo > 0)
            return 'yellow';
        return 'green';
    }
    

    public removeFilter(key: String){
        var vm = this;

        vm.filtro.orderOptions.forEach(function(value, index){
            if(value.key == key)
               vm.filtro.orderOptions.splice(index,1);
        });

        this.redefineOptionsVisible();
        localStorage.setItem('timesheetfiltro',JSON.stringify(this.filtro));
        this.resetData();
    }

    public addFilter(key: String){
        var vm = this;

        vm.options.forEach(function(value){
            if(value.key == key)
               vm.filtro.orderOptions.push(value);
        });

        this.redefineOptionsVisible();
        localStorage.setItem('timesheetfiltro',JSON.stringify(this.filtro));
        this.resetData();
    }

    // public ordenar(){
        // this.listResult.sort((a,b)=>{
        //     if (a[this.sortBy] < b[this.sortBy]) return -1;
        //     else if (a[this.sortBy] > b[this.sortBy]) return 1;
        //     else return 0;
        // })
    // }
    
    public redefineOptionsVisible(){
        var retorno: Array<any> = this.optionsNotUsed;
        retorno.length = 0;

        var vm = this;
        vm.options.forEach(function(value:any){
            var vr = value;
            vm.filtro.orderOptions.forEach(function(value2: any){
                if(value.key == value2.key){
                  vr = null;
                }
            })
            if(vr){
                retorno.push(value);
            }
        })
    }

    private getClone(source:Array<any>){
        return source.map(x => Object.assign({}, x));
    }

    private getDayOfWeek(data:string){
        var date = new Date(data);
        var subData=  new Date(date.getUTCFullYear(), 
                     date.getUTCMonth(), 
                     date.getUTCDate(),  
                     date.getUTCHours(), 
                     date.getUTCMinutes(), 
                     date.getUTCSeconds());
        return this.weekDay[subData.getDay()];
    }
}
