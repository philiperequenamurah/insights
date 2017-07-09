import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import {
    NgbCarouselModule,
    NgbAlertModule
} from '@ng-bootstrap/ng-bootstrap';

import { ChartModule } from 'angular2-highcharts';

import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import {
    TimelineComponent,
    NotificationComponent,
    ChatComponent,
    PingComponent
} from './components';

import { StatModule } from '../../shared';

import {DashboardService} from '../../service/dashboard-service';  

 declare var require: any;

    export function highchartsFactory() {
      const hc = require('highcharts/highstock');
      const hm = require('highcharts/highcharts-more');
      const sg = require('highcharts/modules/solid-gauge');
      hm(hc);
      sg(hc);

      return hc;
    }

        //  .forRoot(
        // require('highcharts/highstock'),
        // require('highcharts/highcharts-more'),  
        // require('highcharts/modules/solid-gauge')        
    // )


@NgModule({
    imports: [
        CommonModule,
        NgbCarouselModule.forRoot(),
        NgbAlertModule.forRoot(),
        DashboardRoutingModule,
        StatModule,
        Ng2Charts,
        ChartModule
    ],
    declarations: [
        DashboardComponent,
        TimelineComponent,
        NotificationComponent,
        PingComponent,
        ChatComponent
    ],  
    providers: [  
    {
          provide: HighchartsStatic,
          useFactory: highchartsFactory
        },
        DashboardService
    ]
})
export class DashboardModule { }