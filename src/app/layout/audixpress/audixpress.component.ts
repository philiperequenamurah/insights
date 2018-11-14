import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import { DndDropEvent } from 'ngx-drag-drop';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {EventEmitterService} from '../../service/emitter/event-emmiter-service';  
import {MantisService} from '../../service/mantis/mantis-service';  
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';


@Component({
    selector: 'app-audixpress',
    templateUrl: './audixpress.component.html',
    styleUrls: ['./audixpress.component.scss'],
    animations: [routerTransition()]
})
export class AudixpressComponent implements OnInit {
    public myDate = {time: new Date()};
    public lastTime = {time: new Date()};
    private sortBy = "label";
    public listClient: Array<any> = [];
    public pinned: any = {labels: [],data: []};
    private opcoes = {requisicao:true,incidente:true,pendente:false, solucionado: false, processando: true, nomeentidade: ""};
    public placerObj = {data: {}};

 draggable = {
    // note that data is handled with JSON.stringify/JSON.parse
    // only set simple data or POJO's as methods will be lost 
    data: this.pinned.data,
    effectAllowed: "all",
    disable: false,
    handle: false
  };

    constructor(private glpiService: GlpiService, private mantisService: MantisService,  private route: ActivatedRoute,
    private router: Router) { }

    ngOnInit() { 
        this.opcoes = JSON.parse(localStorage.getItem('glpiOptions'));
        this.resetGlpi();
        // this.resetMantis();
        this.resetPinned();

        EventEmitterService.get('glpi').subscribe(data => this.resetGlpi());
        setInterval(() => {
            this.resetGlpi();
            // this.resetMantis();
        }, 1000 * 60);
        setInterval(() => {
            this.resetPinned();
        }, 1000 * 10);
        setInterval(() => {
           this.utcTimeStart();
        },1000);

	}

    public resetGlpi(){
        this.opcoes = JSON.parse(localStorage.getItem('glpiOptions'));
        this.glpiService.getGlpi(this.opcoes).subscribe(data => {
            data.data = data.data.filter(dd => ((dd.avencer + dd.vincendo + dd.vencido) > 0));
        	this.montarData('glpi',data);
        });
    }

    public resetPinned(){
        this.glpiService.getPinned().subscribe(data => {
            this.montarDataPinned(this.pinned,data);
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
            this.ordenar();
        }
        return client;
    }

    private montarDataPinned(origem: any, data: any){
            origem.data.length = 0;
            origem.labels.length = 0;
            for (var i in data.labels) {
                origem.labels.push(data.labels[i]);
            }
            for (var i in data.data) {
                origem.data.push(data.data[i]);
            }
            origem.time = data.time
            this.ordenarPinned();
    }

    private montarData(sistema: any, data: any){
        this.listClient.length = 0;
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
    
    public contarTotalGlpi(){
        let total = 0;
        this.listClient.forEach(function(value){
            let dd = value;
            total = total + dd.glpi.avencer + dd.glpi.vincendo + dd.glpi.vencido;
        })
        return total;
    }


    public contarTotalMantis(){
        let total = 0;
        this.listClient.forEach(function(value){
            let dd = value.mantis;
            total = total + (+dd.crash) + (+dd.block) + (+dd.major) + (+dd.other);
        })
        return total;
    }

    public chamados(cliente:any){
        this.router.navigate(['/chamados'], { queryParams: { 'cliente': cliente} });
    }    

    public selectGLPI(op: any){
        this.opcoes[op] = !this.opcoes[op];
        localStorage.setItem('glpiOptions',JSON.stringify(this.opcoes));
        this.resetGlpi();
    }

    public getGLPIOption(op: any){
        return this.opcoes[op];
    }

    public ordenar(){
        this.listClient.sort((a,b)=>{
            if (a[this.sortBy] < b[this.sortBy]) return -1;
            else if (a[this.sortBy] > b[this.sortBy]) return 1;
            else return 0;
        })
    }
    public formatar(label:any, value: any){
        if(label == 'Criacao' || label == 'Vencimento'){
            return moment(value).format('YYYY/MM/DD hh:mm');
        }
        return value;
    }

    public getCssPinned(index: any, obj: any){
        if(index > 0)
            return ;
        var data = moment(obj['Vencimento']);
        if(data.isBefore(new Date()))
            return 'red';
        if(data.clone().add(-7,'day').isBefore(new Date()))
            return 'yellow';
        return 'green';
    }

    public ordenarPinned(){
        let sortBy = 'ordem';
        let sortAsc = true;
        let sortDefault = 'Numero';

        this.pinned.data.sort((a,b)=>{
            if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
            else if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
            else {
                if (a[sortDefault] < b[sortDefault]) return sortAsc ? -1 : 1;
                else if (a[sortDefault] > b[sortDefault]) return sortAsc ? 1 : -1;
                else return 0;
            };
        })
    }

    public unPin(numero){
        this.glpiService.postPin(numero,false,null).subscribe(data => {
            this.resetPinned();
        });
    }

    public openGLPI(obj:any){
        window.open('http://suporte.murah.com.br/front/ticket.form.php?id=' + obj.Numero, '_blank');
    }

// DROP AQUI  
  onDrop(event:DndDropEvent) {
      var ordem = event.index;
      if(ordem > event.data.ordem)
          ordem--;
        this.glpiService.postPin(event.data.Numero,null,ordem).subscribe(data => {
            this.resetPinned();
        });
  }

  onDragStart(data) {
      this.placerObj.data = data;
  }

}
