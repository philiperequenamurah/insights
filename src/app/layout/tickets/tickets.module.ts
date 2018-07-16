import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketsComponent } from './tickets.component';
import { TicketsRoutingModule } from './tickets-routing.module';
import { PageHeaderModule } from './../../shared';

import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

import {DashboardAudiService} from '../../service/dashboard-audi-service';  

 declare var require: any;

    export function highchartsFactory() {
      const hc = require('highcharts/highstock');
      const hm = require('highcharts/highcharts-more');
      const sg = require('highcharts/modules/solid-gauge');
      hm(hc);
      sg(hc);

      return hc;
    }

@NgModule({
    imports: [
        CommonModule,
        TicketsRoutingModule,
        PageHeaderModule
    ],
    declarations: [TicketsComponent],
    providers: [  
    {
          provide: HighchartsStatic,
          useFactory: highchartsFactory
        },
        DashboardAudiService
    ]
})
export class TicketsModule { }
