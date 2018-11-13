import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AudixpressComponent } from './audixpress.component';
import { AudixpressRoutingModule } from './audixpress-routing.module';
import { PageHeaderModule } from './../../shared';

import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {MantisService} from '../../service/mantis/mantis-service';  

import { DndModule } from 'ngx-drag-drop';

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
        AudixpressRoutingModule,
        PageHeaderModule,
        DndModule
    ],
    declarations: [AudixpressComponent],
    providers: [  
    {
          provide: HighchartsStatic,
          useFactory: highchartsFactory
        },
        GlpiService,
        MantisService
    ]
})
export class AudixpressModule { }
