import React from 'react';
import ReactDOM from 'react-dom';
import '../index.css';
import { Scatter } from "react-chartjs-2";


export default class Chart extends React.Component{
  constructor(props){
	super(props)
	
	}
  render() {
	let data1 = []
	let data2 = []
	this.props.data1.forEach((element, index) => {
		data1.push({x: this.props.distance1[index], y: element})
	})
	this.props.data2.forEach((element, index) => {
		data2.push({x: this.props.distance2[index], y: element})
	})
	let label1 = this.props.selected.get(Number(this.props.dataID2))
	let label2 = this.props.selected.get(Number(this.props.dataID1))
	let data = {
		labels: this.props.largestDistance,
		datasets: []
	  }
	  if (data2.length > 0) {
		data.datasets[data.datasets.length] = {
			label: this.props.selected.get(Number(this.props.dataID2)),
			showLine: true,
			fill: false,
			lineTension: 0,
			backgroundColor: 'rgba(75,192,192,1)',
			borderColor: '#ff0000',
			pointBackgroundColor: '#ff0000',
			borderWidth: 2,
			data: data2
		  }
	  }
	  if (data1.length > 0) {
		data.datasets[data.datasets.length] = {
			label: this.props.selected.get(Number(this.props.dataID1)),
			showLine: true,
			fill: false,
			lineTension: 0,
			backgroundColor: 'rgba(75,192,192,1)',
			borderColor: '#0000ff',
			pointBackgroundColor: '#0000ff',
			borderWidth: 2,
			data: data1
		   }
	  }
	  if (this.props.data1.length > 0 || this.props.data2.length > 0) {
		return (
			<div className="chart">
			<Scatter 
				data={data}
				options={{
					type: 'linear',
					responsive: true, 
					tooltips: {
						callbacks: {
							label: function(tooltipItem, data) {
								var dataset = data.datasets[tooltipItem.datasetIndex];
								var index = tooltipItem.index;
								tooltipItem.label = dataset.data[index].x
								return dataset.data[index].x + ': ' + dataset.data[index].y;
							}
						}
					},
					scales: {
						yAxes: [{
						  scaleLabel: {
							display: true,
							labelString: 'Heartrate'
						  }
						}],
						xAxes: [{
							scaleLabel: {
							  display: true,
							  labelString: 'Minutes of Activity'
							}
						  }]
					  }
				}}/>
		  </div>
		  )
	  }
	  else
	  	return <h1>Make a Selection Above</h1>
	  	
	  
  }
}