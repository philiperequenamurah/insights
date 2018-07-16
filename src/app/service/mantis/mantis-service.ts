import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class MantisService {  
	private url: string = 'http://192.168.0.80:10201/';  	

    constructor(private http: Http) {}

	getMantis() {  
	    return this.getResponse('mantis');  
	} 

	private getResponse(endPoint) {
	    return this.http.get(this.url + endPoint)
      		.map(res => res.json());  
	}
}  