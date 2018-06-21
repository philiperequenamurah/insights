import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StartRoutingModule } from './start-routing.module';
import { StartComponent } from './start.component';
import { PageHeaderModule } from './../../shared';

@NgModule({
    imports: [
        CommonModule,
        StartRoutingModule,
        PageHeaderModule
    ],
    declarations: [StartComponent]
})
export class StartModule { }
