import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

@Component({
    selector: 'app-grid',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
    animations: [routerTransition()]
})
export class StartComponent implements OnInit {
    constructor() { }
    ngOnInit() { }
}
