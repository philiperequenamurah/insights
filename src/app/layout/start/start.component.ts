import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Router } from '@angular/router';

@Component({
    selector: 'app-grid',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
    animations: [routerTransition()]
})
export class StartComponent implements OnInit {
    constructor(public router: Router) { }
    ngOnInit() { }

    public redirectSictd(){
        this.router.navigate(['/sictd']);
    }

    public redirectAX(){
        this.router.navigate(['/audixpress']);
    }
}
