import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class GlpiService {  
	private url: string = 'http://' + window.location.hostname + ':10203/';  	

    constructor(private http: Http) {}

	postPin(numero:any,pinned:any, order:any) { 
		let data = {id : numero};
		if(pinned != null)
			data['pin'] = pinned;
		if(order != null)
			data['ordem'] = order;
		return this.postResponse('pin',data);
	} 

	getPinned() {  
		return this.getResponse('tickets/pin',{});
	} 

	getPin() {  
		return this.getResponse('pin',{"pin": true});
	} 

	getGlpi(op: any) {  
		return this.getResponse('status',op);
	} 

	getPorCliente(op: any) {  
		return this.getResponse('tickets',op);
	} 

	getGrupos(op: any) {  
		return this.getResponse('groups',op);
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

	private postResponse(endPoint, body) {
	    return this.http.post(this.url + endPoint, body)
	  		.map(res => res.json());  
	}
}  