import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import {DashboardAudiService} from '../../service/dashboard-audi-service';  

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})
export class TablesComponent implements OnInit {
    public myDate = {time: new Date()};
    public glpi: any = {labels: [],data: []};
    public mantis: any = {labels: [],data: []};

    constructor(private dashboardAudiService: DashboardAudiService) { }
    ngOnInit() { 
        this.resetGlpi();
        this.resetMantis();
        setInterval(() => {
	        this.resetGlpi();
	        this.resetMantis();
        }, 1000 * 60);
        setInterval(() => {
           this.utcTimeStart();
        },1000);
	}

    public resetGlpi(){
        this.dashboardAudiService.getGlpi().subscribe(data => {
        	this.montarData(this.glpi,data);
        });
    }

    private montarData(origem: any, data: any){
            origem.data.length = 0;
            origem.labels.length = 0;
            for (var i in data.labels) {
                origem.labels.push(data.labels[i]);
            }
            for (var i in data.data) {
                origem.data.push(data.data[i]);
            }
            origem.time = data.time
            console.log(origem);

    }
    public resetMantis(){
        this.dashboardAudiService.getMantis().subscribe(data => {
           this.montarData(this.mantis,data);
        });
    }

    public utcTimeStart() {
        this.myDate.time = new Date();
    }

    public getCssMantis(qtd: any){}

    public countMantis(dd: any){
        return (+dd.crash) + (+dd.block) + (+dd.major) + (+dd.other);
    }
}
