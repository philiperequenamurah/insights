import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import {DashboardService} from '../../service/dashboard-service';  


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    public myDate = {time: new Date()};
    public audioSirene = new Audio();
    public totalTransmissao = {time: new Date(),totalLote : 0,totalImagem: 0};
    public alerts: Array<any> = [];
    public ping: any = {data: []};
    public gBarra: any = {
        options: {
            scaleShowVerticalLines: false,
            responsive: true,
            legend : {
                display: true,
                position: 'bottom'
            },
             animation: {
               onComplete: function () {
                   var chartInstance = this.chart,
                   ctx = chartInstance.ctx;
                   ctx.textAlign = 'center';
                   ctx.textBaseline = 'bottom';
                   this.data.datasets.forEach(function (dataset, i) {
                       var meta = chartInstance.controller.getDatasetMeta(i);
                       meta.data.forEach(function (bar, index) {
                           var data = dataset.data[index];
                           ctx.fillStyle='#000';
                           ctx.font='20px';
                           ctx.fillText(data, bar._model.x, bar._model.y);
                       });
                   });
               }
           },
        },
        labels:  ['Lotes por Posição'],
        type:  'bar',
        legend: true,
        data: [
            { data: [100], label: 'Captura'},
            { data: [100], label: 'Recaptura' },
            { data: [100], label: 'Tratamento' },
            { data: [100], label: 'OCR' },
            { data: [100], label: 'Exportação' }    
        ]
    };

    public timeLine: any = {
        options:  {
            responsive: true
        },
        labels: ['-30', '-25', '-20', '-15', '-10', '-05', '00'],
        legend: true,
        type: 'line',
        time: '',
        data: [
            { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A',fill:false },
            { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B',fill:false },
            { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C',fill:false }
        ]
    };

    public desempenho: any = {data: {}, time :'',exportacao:'',
     subida: {
    chart: {
        type: 'solidgauge',
         height: 200,
          width: 250
    },

    title: '',

    pane: {
        center: ['50%', '70"%'],
        size: '100%',
        startAngle: -90,
        endAngle: 90
        // ,
        // background: {
        //     backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
        //     innerRadius: '60%',
        //     outerRadius: '100%',
        //     shape: 'arc'
        // }
    },

    tooltip: {
        enabled: false
    },
    exporting: { 
        enabled: false 
    },

    // the value axis
    yAxis: {
        stops: [
            [0.1, '#55BF3B'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#DF5353'] // red
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
            text: 'Subida de Imagem',   
            style: { "color": "#333333", "fontSize": "16px" }, 
            y: -70
        },
        labels: {
            y: 16
        }, min: 0,
        max: 200
    },

    plotOptions: {
        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true
            }
        }
    }, credits: {
        enabled: false
    },
    dataLabels:{
        enabled: true
    },
    series: [{
        name: 'Velocidade',
        data: [80],
        inside:true,

        dataLabels: {
            enabled: true,
            style: {"color": "contrast", "fontSize": "20px", "fontWeight": "bold", "textOutline": "1px contrast" }
        //     format: '<div style="text-align:center"><span style="font-size:25px;' +
        //         + '">{y}</span><br/>' +
        //            '<span style="font-size:12px;color:silver">Img/m</span></div>'
        },
        tooltip: {
            valueSuffix: ' Img/m'
        }
    }]
    }};
    constructor(private dashboardService: DashboardService) {
        this.desempenho.exportacao = JSON.parse(JSON.stringify(this.desempenho.subida));
        this.desempenho.exportacao.yAxis.title.text='Exportação';
        // console.log();
        // this.alerts.push({
        //     id: 1,
        //     type: 'success',
        //     message: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        //         Voluptates est animi quibusdam praesentium quam, et perspiciatis,
        //         consectetur velit culpa molestias dignissimos
        //         voluptatum veritatis quod aliquam! Rerum placeat necessitatibus, vitae dolorum`
        // }, {
        //     id: 2,
        //     type: 'warning',
        //     message: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        //         Voluptates est animi quibusdam praesentium quam, et perspiciatis,
        //         consectetur velit culpa molestias dignissimos
        //         voluptatum veritatis quod aliquam! Rerum placeat necessitatibus, vitae dolorum`
        // });
    }

    ngOnInit() {
        this.audioSirene.src = "../../../assets/sounds/sirene.mp3";
        this.audioSirene.load();
        this.utcTimeStart();
        this.resetGBarra();
        this.resetTimeLine();
        this.resetPing();
        this.resetTotalTransmissao();
        this.resetDesempenho();
        setInterval(() => {
          this.resetGBarra();
          this.resetTimeLine();
          this.resetPing();
          this.resetTotalTransmissao();
          this.resetDesempenho();
        }, 1000 * 60);
        setInterval(() => {
           this.utcTimeStart();
        },1000);
    }

    public resetGBarra(){
        this.dashboardService.getGBarra().subscribe(data => {
            const clone = JSON.parse(JSON.stringify(this.gBarra));
            var valor =[0,0,0,0,0];
            for (var i = 0; i < data.data.length; ++i) {
                var v = data.data[i];
                var total = parseInt(v.total);
                if(v.status == 6 || v.status == 14 || v.status == 16)
                    valor[1] = valor[1] + total;
                else if(v.status == 19 || v.status == 17 || v.status == 15 || v.status == 5)
                    valor[2] = valor[2] + total;
                else if(v.status == 7){
                    if(v.etapa == 4)
                        valor[0] += total;
                    else if (v.etapa == 0)
                        valor[3] += total;
                    else if (v.etapa == 3)
                        valor[4] += total;
                }else if(v.status == 4)
                    valor[4] += total;
            }
            for (var i = 0; i < 5; ++i) 
                clone.data[i].data[0] = valor[i];
            clone.time = new Date(data.time);
            this.gBarra = clone;
        });
    }

    public resetTimeLine(){
        this.dashboardService.getTimeLine().subscribe(data => {
            const clone = JSON.parse(JSON.stringify(this.timeLine));
            clone.data = data.data;
            clone.labels = data.labels;
            clone.time = new Date(data.time);
            this.timeLine = clone;
        });
    }

    public resetPing(){
        this.dashboardService.getPing().subscribe(data => {
            this.ping.data.length = 0;
            var statusFinal = 0;
            for (var i in data.data) {
                var v = data.data[i];
                v.maq = v.maq.replace('Q511','');
                v.maq = v.maq.replace('ETAD','');
                this.ping.data.push(v);
                v.criticalCss = 'btn-' + this.defineButtonCritical(v.status);
                v.url = this.defineLogsUrl(v);
                if(v.status == 1 && statusFinal == 0)
                    statusFinal = v.status;
                else if (v.status != 0 && v.status != 1)
                    statusFinal = v.status;
            };

            this.ping.criticalCss = 'card-' + this.defineButtonCritical(statusFinal);
            this.ping.time = new Date(data.data[0].time);
            this.ping.status = statusFinal;
            if(this.defineButtonCritical(statusFinal) == 'danger'){
                this.audioSirene.load();
                this.audioSirene.play();
                 setTimeout(() => {
                     this.audioSirene.pause();
                    }, 1000 * 5);
            }

        });
    }

    public resetTotalTransmissao(){
        this.dashboardService.getTotalTransmissao().subscribe(data => {
            this.totalTransmissao.time = new Date(data.time);
            this.totalTransmissao.totalImagem = data.totalImagem;
            this.totalTransmissao.totalLote = data.totalLote;
        });
    }

    public resetDesempenho(){
        this.dashboardService.getDesempenho().subscribe(data => {
            this.desempenho.data = data;
            this.desempenho.time = new Date(data.time);
            const clone = JSON.parse(JSON.stringify(this.desempenho.exportacao));
            clone.series[0].data[0]=parseInt(data.exportacao.total);
            clone.yAxis.max = 3000;
            clone.yAxis.title.text='Exportação max('+data.exportacao.max+')';
            this.desempenho.exportacao = clone;
            const clone2 = JSON.parse(JSON.stringify(this.desempenho.subida));
            clone2.series[0].data[0]=parseInt(data.subida.total);
            clone2.yAxis.max = 3000;
            clone2.yAxis.title.text='Subida max('+data.subida.max+')';
            this.desempenho.subida = clone2;
        });
    }

    private defineButtonCritical(status: any){
        if(status == 0)
            return 'success';
        if(status == 1)
            return 'warning';
        else
            return 'danger'
    }

    private defineLogsUrl(mq: any){
        var url = 'https://caixa.murah.info.tm/contexpress-server/logs.do?protocol=http&ip=' + mq.ip + '&porta=';
        if(mq.maq.endsWith('_1'))
            url+='12280&t=50000';
        else if(mq.maq.endsWith('_2'))
            url+='12380&t=50000';    
        else if(mq.maq.endsWith('_3'))
            url+='12480&t=50000';
        else if(mq.maq.endsWith('CETAD'))
            url+='12680&t=50000';
        return url;
    }

    public redirectLog(url: any){
        window.open(
          url,
          '_blank'
        );
    }
    public closeAlert(alert: any) {
        const index: number = this.alerts.indexOf(alert);
        this.alerts.splice(index, 1);
    }

    public utcTimeStart() {
        this.myDate.time = new Date();
    }

    public showVersion(){
        alert('0.10');
    }
    
    options : Object;
}
