import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {MantisService} from '../../service/mantis/mantis-service';  
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-audixpress',
    templateUrl: './audixpress.component.html',
    styleUrls: ['./audixpress.component.scss'],
    animations: [routerTransition()]
})
export class AudixpressComponent implements OnInit {
    public myDate = {time: new Date()};
    public lastTime = {time: new Date()};
    
    public listClient: Array<any> = [];

    private opcoes = {requisicao:true,incidente:true,pendente:false, solucionado: false, processando: true, nomeentidade: ""};

    constructor(private glpiService: GlpiService, private mantisService: MantisService,  private route: ActivatedRoute,
    private router: Router) { }

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
        this.glpiService.getGlpi(this.opcoes).subscribe(data => {
        	this.montarData('glpi',data);
        });
    }
    private getClient(label: any){
        var client = null;

        this.listClient.forEach(function(value: any){
            if(value.label == label){
                client=value;
            }
        })

        if(client === null){
            client = {"label" : label, glpi : {avencer:0,vincendo:0,vencido:0}, mantis: {block:0,crash:0,major:0,other:0} };
            this.listClient.push(client);

            this.listClient.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });

        }
        return client;
    }

    private montarData(sistema: any, data: any){

        this.listClient.forEach(function(value: any){
            for (var j in value[sistema]) {
                value[sistema][j]=0;
            }
        })
            
            
        for (var i in data.data) {
            var client= this.getClient(data.data[i].name);
            client[sistema]={};
            for (var j in data.data[i]) {
                client[sistema][j]=data.data[i][j]
            }
        }
        this.lastTime.time = data.time;

    }

    public resetMantis(){
        this.mantisService.getMantis().subscribe(data => {
           this.montarData('mantis',data);
        });
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
    
    public chamados(cliente:any){
        this.router.navigate(['/chamados'], { queryParams: { 'cliente': cliente, 'opcoes' : JSON.stringify(this.opcoes) } });
    }    

    public selectGLPI(op: any){
        this.opcoes[op] = !this.opcoes[op];
        this.resetGlpi();
    }

    public getGLPIOption(op: any){
        return this.opcoes[op];
    }
}
