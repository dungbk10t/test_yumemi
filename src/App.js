import React, { useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const data = [];
const prefs = [
  {
    code: 1,
    name: "C",
    color: dynamicColors(),
  },
  {
    code: 2,
    name: "G",
    color: dynamicColors(),
  },
  {
    code: 3,
    name: "L",
    color: dynamicColors(),
  },
];
const years = [0, 1980, 1990, 2000, 2010, 2020];

years.forEach((year) => {
  let e = {};
  e["year"] = year;
  prefs.forEach((pref) => {
    e[pref.name] = getRandomArbitrary(1000, 10000);
  });
  data.push(e);
});

function App() {
  const [checked, setChecked] = useState(new Array(prefs.length).fill(false));

  const handleOnChange = (position) => {
    const updatedCheckedState = checked.map((item, index) =>
      index === position - 1 ? !item : item
    );
    setChecked(updatedCheckedState);
  };

  const [opacity, setOpacity] = useState({
    C: 1,
    G: 1,
  });

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
          {prefs.map((pref) => (
            <div key={pref.code}>
              <input
                type="checkbox"
                id={pref.code}
                name={pref.name}
                value={pref.name}
                checked={checked[pref.code - 1]}
                onChange={() => handleOnChange(pref.code)}
              />
              <label>{pref.name}</label>
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
            <XAxis dataKey="year" />
            <YAxis
              label={{
                value: "人口数",
                offset: -12,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {prefs.map((pref) =>
              checked[pref.code - 1] ? (
                <Line
                  type="monotone"
                  key={pref.code}
                  dataKey={pref.name}
                  stroke={pref.color}
                  strokeOpacity={opacity[pref.name]}
                  activeDot={{ r: 8 }}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
