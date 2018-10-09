import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    constructor(public router: Router) { }

    ngOnInit() {

    	if (!localStorage.getItem('glpiOptions')){
    		let op = {requisicao:true,incidente:true,pendente:false, solucionado: false, nomeentidade: "", processando: true};
    		localStorage.setItem('glpiOptions',JSON.stringify(op)) ;
    	}
        if (this.router.url === '/') {
            this.router.navigate(['/start']);
        }
    }

}
