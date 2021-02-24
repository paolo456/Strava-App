import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import Chart from './components/Chart'
import reportWebVitals from './reportWebVitals';
import $ from 'jquery'


const client_secret = '675faff1ca69ed58784ccaa816922d9a54c8e0ec'
const refresh_token = 'f587298b18557240448f5dbd65ba79c81595dadb'
const client_id = '61512'
const callRefreshURL = 'https://www.strava.com/oauth/token?client_id='+client_id+'&client_secret='+client_secret+'&refresh_token='+refresh_token+'&grant_type=refresh_token'

class Container extends React.Component {
	constructor(props) {
		super(props)
		this.reduceData = this.reduceData.bind(this)
		this.state = {
			access_token: {},
			refresh_token: {},
			activities: [],
			imageURL: [],
			selected: new Map(),
			nextColor: 'red',
			heartrate1: [],
			heartrate2: [],
			distance1: [],
			distance2: [],
			dataID1: '',
			dataID2: ''
		}
	}
	componentDidMount() {
		axios.post(callRefreshURL).then(results => {
			let access_token = results.data.access_token
			let refresh_token = results.data.refresh_token
			this.setState({
				access_token: access_token,
				refresh_token: refresh_token
			})
			this.getActivites(null)
		})
	}
	getActivites(filterNumber) {
		if (this.state.access_token !== '') {
			let num = filterNumber !== null ? filterNumber : '4'
			const URL = 'https://www.strava.com/api/v3/athlete/activities?per_page='+num+'&access_token='+this.state.access_token
			if (this.state.activities.length > 0) {
				this.setState({
					activities: [],
					imageURL: []
				})
			}
			axios.get(URL, {method: 'GET'}).then(results => {
				
				this.setState({
					activities: results.data
				})
				this.getMaps()
			})
		}
	}
	getMaps() {
		this.state.activities.forEach(element => {
			console.log(element)
			const map = 'https://maps.googleapis.com/maps/api/staticmap\?size=600x300&maptype=roadmap\&path=enc:'+element.map.summary_polyline+'\&key=AIzaSyBgqwajgRIEaLQ92J7ahUndHvd7NJYIDPY'
			axios.get(map).then(results => {
				console.log(results.request.responseURL)
				let image = {id: element.id, url: results.request.responseURL,}
				this.setState({
					imageURL: this.state.imageURL.concat(image),
				})
			})
		})
		
	}
	reduceData(results, toggle) {
		let reducedHeartRate = []
		let metersToMiles = []
		//reduce the array by 10%
		for(let [index, item] of results.data.heartrate.data.entries()) {
			if(index % 20 === 0) {
				reducedHeartRate.push(item)
				metersToMiles.push((results.data.time.data[index]/60).toFixed(0))
			}
		}
		return toggle == 'hr' ? reducedHeartRate : metersToMiles
	}
	handleClick(id, element) {
		const hrURL = 'https://www.strava.com/api/v3/activities/'+id+'/streams?keys=heartrate,time&key_by_type=true&access_token='+this.state.access_token
		
		//change border color
		let red = document.querySelector('.red')
		if (document.querySelectorAll('.selected').length > 1) {
			if (element.target.classList.contains('selected')) {
				this.removeChartDataFromState(element)
				element.target.className = 'tile'
				this.setActivityDescription(id)
			}
			return
		}
		if (!element.target.classList.contains('selected')) {
			if (red) {
				element.target.classList.add('selected', 'blue')
				axios.get(hrURL).then((results) => {
					let id = results.config.url.split('/')[6]
					this.setState({
						dataID1: id,
						heartrate1: this.reduceData(results, 'hr'),
						distance1: this.reduceData(results, 'dist')
					})
				})
			}
			else {
				element.target.classList.add('selected', 'red')
				axios.get(hrURL).then((results) => {
					let id = results.config.url.split('/')[6]
					this.setState({
						dataID2: id,
						heartrate2: this.reduceData(results, 'hr'),
						distance2: this.reduceData(results, 'dist')
					})
				})
			}
				
		}
		else {
			this.removeChartDataFromState(element)
			element.target.className = 'tile'
		}
		this.setActivityDescription(id)
		
	}
	setActivityDescription(id) {
		let label = this.state.activities.find((exercise) => {return exercise.id == id}).name
		let findTime = this.state.activities.find((exercise) => {return exercise.id == id}).start_date_local
		let time = this.tConvert(findTime.split('T')[1].substr(0, findTime.split('T')[1].length-1))
		label = label + ' - ' + time
		this.state.selected.get(id) ? 
		this.state.selected.delete(id) : 
		this.setState({
			selected: this.state.selected.set(id, label)
		})
	}
	tConvert(time) {
		// Check correct time format and split into components
		time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
	  
		if (time.length > 1) { // If time format correct
		  time = time.slice (1);  // Remove full string match value
		  time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
		  time[0] = +time[0] % 12 || 12; // Adjust hours
		}
		return time.join (''); // return adjusted time or original string
	}
	removeChartDataFromState(element) {
		element.target.classList.contains('red') ?
			this.setState({
				heartrate2: [],
				distance2: []
			}) :
			this.setState({
				heartrate1: [],
				distance1: []
			})
	}
	render() {
		const maps = this.state.imageURL.map((activity) => {
			return (
				<div className="tile-container" key={activity.id}>
					<img 
						className='tile'
						src={activity.url}
						onClick={(element) => this.handleClick(activity.id, element)}
						onMouseLeave={(element) => {
							element.target.classList.add('tile-mouse-out')
							let tiles = $('.tile')
							tiles.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
								function() {
									$(this).removeClass('tile-mouse-out')
								}
							)
							}}>
					</img>
				</div>
			)
		})
		return (this.state.access_token ? <div className="container">
			<div className="maps">
				<div>{maps}</div>
			</div>
			<div className='filter'>
				<ul id="myUL">
					<li><a onClick={() => this.getActivites('4')}>4 - Tiles</a></li>
					<li><a onClick={() => this.getActivites('6')}>6 - Tiles</a></li>
					<li><a onClick={() => this.getActivites('8')}>8 - Tiles</a></li>
					<li><a onClick={() => this.getActivites('10')}>10 - Tiles</a></li>
					<li><a onClick={() => this.getActivites('200')}>All Activities</a></li>
				</ul>
			</div>
			<Chart width={500} height={500} 
				data1={this.state.heartrate1}
				data2={this.state.heartrate2}
				dataID1={this.state.dataID1}
				dataID2={this.state.dataID2}
				selected={this.state.selected}
				distance1={this.state.distance1}
				distance2={this.state.distance2}
				largestDistance = {this.state.distance1.length > this.state.distance2.length ? this.state.distance1 : this.state.distance2}
				/>
				
		</div> : <h1>loading</h1>)
	}
}
ReactDOM.render(<Container />, document.getElementById('root'))
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
