import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChamadosComponent } from './chamados.component';
import { ChamadosRoutingModule } from './chamados-routing.module';
import { PageHeaderModule } from './../../shared';

import {GlpiService} from '../../service/glpi/glpi-service';  
import {MantisService} from '../../service//mantis/mantis-service';  


@NgModule({
    imports: [
        CommonModule,
        ChamadosRoutingModule,
        PageHeaderModule
    ],
    declarations: [ChamadosComponent],
    providers: [  
        GlpiService,
        MantisService
    ]
})
export class ChamadosModule { }
