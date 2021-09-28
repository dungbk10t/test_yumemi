import React, { useEffect, useState } from "react";
import "./App.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Returns a random number between min (inclusive) and max (exclusive)
// function getRandomArbitrary(min, max) {
//   return parseInt(Math.random() * (max - min) + min);
// }

var dynamicColors = function() {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgb(" + r + ", " + g + ", " + b + ")";
};

const years = [1970, 1980, 1990, 2000, 2010, 2020];

const API_KEY = `${process.env.REACT_APP_RESAS_API_KEY}`;
const PREFIX = "https://opendata.resas-portal.go.jp/api/v1"

export default function App() {
  const [prefs, setPrefs] = useState([]);
  const [data, setData] = useState([]);
  const [saved, setSaved] = useState([]);
  const [checked, setChecked] = useState([]);
  
  useEffect(() => {
    const fetchData = () => {
      axios.get(`${PREFIX}/prefectures`, {
        headers: {
          "X-API-KEY": API_KEY,
        },
      })
      .then(response =>{
        var fetchedPrefs = [...response.data.result];
        // var fetchedData = [];
        var opacities = {};
        fetchedPrefs.forEach((pref) => {
          pref["color"] = dynamicColors();
          opacities[pref.prefName] = 1;
        });
        setSaved(new Array(fetchedPrefs.length).fill(false));
        setChecked(new Array(fetchedPrefs.length).fill(false));
        setOpacity(opacities);
        setPrefs([...fetchedPrefs]);
      })
      .catch(e => {
        console.log(e);
      })
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleOnChange = (position) => {
    var currentData = data;
    if (!checked[position-1] && !saved[position-1]) {
      axios.get(`${PREFIX}/population/composition/perYear?cityCode=-&prefCode=${prefs[position-1].prefCode}`, {
        headers: {
          "X-API-KEY": API_KEY,
        },
      })
      .then(response =>{
        var fetchedData = response.data.result.data[0].data;
        if (currentData.length === 0) {
          years.forEach((year) => {
            let e = {};
            e["year"] = year;
            currentData.push(e);
          });
        }
        fetchedData.forEach((item1) => {
          currentData.forEach((item2) => {
            if (item1["year"] === item2["year"]) {
              item2[prefs[position-1].prefName] = item1["value"];
            }
          });
        });
        setData([...currentData]);
        saved[position-1] = true;
      })
      .catch(e => {
        console.log(e);
      })
    }
    const updatedCheckedState = checked.map((item, index) =>
      index === position - 1 ? !item : item
    );
    setChecked(updatedCheckedState);
  };
  
  const [opacity, setOpacity] = useState({});

  const handleMouseEnter = (o) => {
    const { dataKey } = o;
    setOpacity({ ...opacity, [dataKey]: 0.5 });
  };

  const handleMouseLeave = (o) => {
    const { dataKey } = o;
    setOpacity({ ...opacity, [dataKey]: 1 });
  };
  
  return (
    <div className="App">
      <div className="prefs-container">
        <h3>都道府県</h3>
        <div className="prefs-list">
          {prefs.map(pref => (
            <div className="pref-item" key={pref.prefCode}>
              <input
                type="checkbox"
                id={pref.prefCode}
                name={pref.prefName}
                value={pref.prefName}
                checked={checked[pref.prefCode-1]}
                onChange={() => handleOnChange(pref.prefCode)} 
              />
              <label>{pref.prefName}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: '年度', position: 'insideBottomRight', offset: 0 }} padding={{ left: 20, right: 60 }} />
            <YAxis label={{ value: '人口数', position: 'insideTopLeft', offset: 0 }} padding={{ top: 60, left: 10 }} />
            <Tooltip />
            <Legend onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
            {prefs.map(pref => checked[pref.prefCode - 1] ? (
              <Line
                type="monotone"
                key={pref.prefCode}
                dataKey={pref.prefName}
                stroke={pref.color}
                strokeOpacity={opacity[pref.prefName]}
                activeDot={{ r: 8 }}
              />
            ) : null)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}