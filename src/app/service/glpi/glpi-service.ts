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

	getGlpi() {  
	    return this.getResponse('glpi');  
	} 

	getGlpiOptions(op: any) {  
		  let search: URLSearchParams = new URLSearchParams();
		  let opProps = Object.keys(op);
		  for (var prop in opProps) {
		  	var label = opProps[prop];
		  	search.set(label,op[label]);
		  }
		  return this.http.get(this.url + 'glpi', new RequestOptions({ "search":search}))
      		.map(res => res.json());  
	} 

	getPorCliente(cliente) {  
	    return this.getResponse('glpi/tickets?nomeentidade=' + cliente);  
	} 

	private getResponse(endPoint) {
	    return this.http.get(this.url + endPoint)
      		.map(res => res.json());  
	}
}  