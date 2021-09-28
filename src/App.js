import React, { useEffect } from "react";
import "./App.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {

  const data = [];
  const prefs = ['C', 'G'];
  const years = [0, 1980, 1990, 2000, 2010, 2020];

  // Returns a random number between min (inclusive) and max (exclusive)
  function getRandomArbitrary(min, max) {
    return parseInt(Math.random() * (max - min) + min);
  }

  var dynamicColors = function () {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + ", " + g + ", " + b + ")";
  };

  useEffect(() => {
    years.forEach(function (year) {
      let e = {};
      e["year"] = year;
      prefs.forEach(function (pref) {
        e[pref] = getRandomArbitrary(1000, 10000);
      });
      data.push(e);
    });
    console.log(prefs, data);
  });

  return (
    <div className="App">
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
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {prefs.map(pref => (
            <Line type="monotone" key={pref} dataKey={pref} stroke={dynamicColors()} activeDot={{ r: 8 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;