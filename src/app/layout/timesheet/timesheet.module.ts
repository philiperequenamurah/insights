import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { TimesheetComponent } from './timesheet.component';
import { TimesheetRoutingModule } from './timesheet-routing.module';
import { PageHeaderModule } from './../../shared';

import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {MantisService} from '../../service//mantis/mantis-service';  
import {RunrunService} from '../../service/runrun/runrun-service';  

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
        TimesheetRoutingModule,
        PageHeaderModule,
        NgbDropdownModule.forRoot()
    ],
    declarations: [TimesheetComponent],
    providers: [  
    {
          provide: HighchartsStatic,
          useFactory: highchartsFactory
        },
        GlpiService,
        MantisService,
        RunrunService
    ]
})
export class TimesheetModule { }
