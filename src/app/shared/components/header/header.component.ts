import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GlpiService } from '../../../service/glpi/glpi-service';  
import {EventEmitterService} from '../../../service/emitter/event-emmiter-service';  

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    public myDate = {time: new Date()};
    public listGrupo = {data : []};
    public grupoSelecionado = {id: 0, name:'Filtrar Grupo'};
    public timerApresetacao = {status:false, timer:null};

    constructor(private translate: TranslateService, public router: Router, private glpiService: GlpiService) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992) {
                this.toggleSidebar();
            }
        });

        this.glpiService.getGrupos({}).subscribe(data => {
            var opcoes = JSON.parse(localStorage.getItem('glpiOptions'));
            this.listGrupo.data = [];
            if(opcoes['grupo'])
                this.grupoSelecionado.name = opcoes['grupo'];

            this.listGrupo.data.push({id:0,name:'Todos'});
            for (var i in data.data) {
                this.listGrupo.data.push(data.data[i]);
            }
        });

    }


    public utcTimeStart() {
        this.myDate.time = new Date();
    }

    ngOnInit() {
        setInterval(() => {
           this.utcTimeStart();
        },1000);

    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('push-right');
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    public selecionarGrupo(ob:any){
        var opcoes = JSON.parse(localStorage.getItem('glpiOptions'));

        if(ob.id == 0){
            this.grupoSelecionado = {id: 0, name:'Filtrar Grupo'};
            opcoes['grupo'] = null;
        }
        else{
            this.grupoSelecionado = ob;
            opcoes['grupo'] = this.grupoSelecionado.name;
        }

        localStorage.setItem('glpiOptions',JSON.stringify(opcoes));

        EventEmitterService.get('glpi').emit('emitĺerolero');
    }

    public modoApresentacao(){
     if(this.timerApresetacao.status){
         this.timerApresetacao.status = false; 
         clearInterval(this.timerApresetacao.timer);
     }
     else{
          this.timerApresetacao.status = true;

            this.timerApresetacao.timer = setInterval(() => {
            if (this.router.url === '/sictd') 
                this.router.navigate(['/audixpress']);           //  this.resetMantis();
            else
                this.router.navigate(['/sictd']);           //  this.resetMantis();
            }, 1000 * 5);   
        }
     }        
}
