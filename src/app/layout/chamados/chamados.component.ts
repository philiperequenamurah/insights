import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {MantisService} from '../../service/mantis/mantis-service';  
import {EventEmitterService} from '../../service/emitter/event-emmiter-service';  
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'app-chamados',
    templateUrl: './chamados.component.html',
    styleUrls: ['./chamados.component.scss'],
    animations: [routerTransition()]
})
export class ChamadosComponent implements OnInit {
    public myDate = {time: new Date()};
    public chamados: any = {labels: [],data: []};
    public cliente: any;
    public sortBy = "Numero";
    public sortDefault = "Numero";
    public sortAsc = true;
    private opcoes: any;
    private lastPinned: Array<any> = []

    constructor(private glpiService: GlpiService,private mantisService: MantisService,  private route: ActivatedRoute,
    private router: Router) { }
    ngOnInit() { 
         this.route
              .queryParams
              .subscribe(params => {
                // Defaults to 0 if no query param provided.
                this.cliente = params['cliente'];
         });
    
        EventEmitterService.get('glpi').subscribe(data => this.resetGlpi());

         this.opcoes = JSON.parse(localStorage.getItem('glpiOptions'));

         this.resetPinned();
         
        // this.resetMantis();
        setInterval(() => {
	       this.resetGlpi();
	       //  this.resetMantis();
           this.resetPinned();
        }, 1000 * 60);
        setInterval(() => {
           this.utcTimeStart();
        },1000);
	}

    private resetGlpi(){
        // console.log(this.opcoes);
        this.opcoes = JSON.parse(localStorage.getItem('glpiOptions'));
        this.opcoes.nomeentidade = this.cliente;
        this.glpiService.getPorCliente(this.opcoes).subscribe(data => {
            this.montarData(this.chamados,data);
        });
    }

    private resetPinned(){
        // console.log(this.opcoes);
        this.glpiService.getPin().subscribe(data => {
            this.lastPinned.length = 0;
            for (var i in data) {
                this.lastPinned.push(data[i]);
            }
            // console.log("agora");
            // console.log(data);
            this.resetGlpi();
        });
    }

    private montarData(origem: any, data: any){
            origem.data.length = 0;
            origem.labels.length = 0;
            for (var i in data.labels) {
                origem.labels.push(data.labels[i]);
            }
            for (var i in data.data) {
                var vlr = data.data[i];
                // console.log(vlr);
                // console.log(vlr.Pinned + " " + this.isPinned(vlr.Numero));
                vlr.Pinned = this.isPinned(vlr.Numero);
                origem.data.push(data.data[i]);
            }
            // console.log(this.lastPinned);
            origem.time = data.time
            this.ordenar(null);
            // console.log(origem);
    }

    private isPinned(numero: any){
            for (var i in this.lastPinned) {
                if(this.lastPinned[i]._id == numero)
                    return this.lastPinned[i].pin;
            }
            return false;
    }

    public utcTimeStart() {
        this.myDate.time = new Date();
    }

    public formatar(label:any, value: any){
        if(label == 'Criacao' || label == 'Vencimento'){
            return moment(value).format('YYYY/MM/DD hh:mm');
        }
        return value;
    }

    public getCssGLPI(index: any, obj: any){
        if(index > 0)
            return ;
        var data = moment(obj['Vencimento']);
        if(data.isBefore(new Date()))
            return 'red';
        if(data.clone().add(-7,'day').isBefore(new Date()))
            return 'yellow';
        return 'green';
    }

    public openGLPI(obj:any){
        window.open('http://suporte.murah.com.br/front/ticket.form.php?id=' + obj.Numero, '_blank');
    }

    public selectGLPI(op: any){
        this.opcoes[op] = !this.opcoes[op];
        localStorage.setItem('glpiOptions',JSON.stringify(this.opcoes));
        this.resetGlpi();
    }

    public getGLPIOption(op: any){
        return this.opcoes[op];
    }

    public ordenar(coluna){
        if(this.sortBy = coluna)
            this.sortAsc = !this.sortAsc
        else
            this.sortAsc = true;
        if(coluna)
            this.sortBy = coluna;
        this.chamados.data.sort((a,b)=>{
            if (a[this.sortBy] < b[this.sortBy]) return this.sortAsc ? -1 : 1;
            else if (a[this.sortBy] > b[this.sortBy]) return this.sortAsc ? 1 : -1;
            else {
                if (a[this.sortDefault] < b[this.sortDefault]) return this.sortAsc ? -1 : 1;
                else if (a[this.sortDefault] > b[this.sortDefault]) return this.sortAsc ? 1 : -1;
                else return 0;
            };
        })
    }

    public setPin(dd){
        this.glpiService.postPin(dd.Numero,(dd.Pinned != true)).subscribe(data => {
            this.resetPinned();
        });
    }
}
