import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class DashboardService {  
	private url: string = 'http://caixa.murah.info.tm:10201/';  	

    constructor(private http: Http) {}

	getGBarra() {  
	    return this.getResponse('gBarra');  
	}  

	getTimeLine() {  
	    return this.getResponse('timeLine');  
	} 

	getPing() {  
	    return this.getResponse('ping');  
	} 
	getTotalTransmissao(){
	return this.getResponse('totalTransmissao');  	
	}

	getDesempenho(){
	return this.getResponse('desempenho');  	
	}
	private getResponse(endPoint) {
	    return this.http.get(this.url + endPoint)
      		.map(res => res.json());  
	}
}  