import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class GlpiService {  
	private url: string = 'http://192.168.0.80:10201/';  	

    constructor(private http: Http) {}

	getGlpi(op: any) {  
		return this.getResponse('glpi',op);
	} 

	getPorCliente(op: any) {  
		return this.getResponse('glpi/tickets',op);
	} 

	getGrupos(op: any) {  
		return this.getResponse('glpi/groups',op);
	} 

	private getResponse(endPoint, params) {
		if(params == null)
		    return this.http.get(this.url + endPoint)
	      		.map(res => res.json());  
	    else {
		  let search: URLSearchParams = new URLSearchParams();
		  let opProps = Object.keys(params);
		  for (var prop in opProps) {
		  	var label = opProps[prop];
		  	search.set(label,params[label]);
		  }
		  return this.http.get(this.url + endPoint, new RequestOptions({ "search":search}))
      		.map(res => res.json());  
	    }
	}
}  