import React, { useEffect, useState } from "react";
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
import axios from "axios";

/* Returns a random number between min (inclusive) and max (exclusive) 
// function getRandomArbitrary(min, max) {
//   return parseInt(Math.random() * (max - min) + min);}

/**
   * @Fuction : Automatically generate color for each line corresponding to the provinces
   * @returns : RGB code color
   * @CreatedBy : Pham Tuan Dung - 28/09/2021
   * @ModifiedBy : Pham Tuan Dung - 28/09/2021
*/
var dynamicColors = function () {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgb(" + r + ", " + g + ", " + b + ")";
};

const years = [1970, 1980, 1990, 2000, 2010, 2020];
// API KEY
const API_KEY = `${process.env.REACT_APP_RESAS_API_KEY}`;
// The front fixed cluster is in the structure of the API
const PREFIX = "https://opendata.resas-portal.go.jp/api/v1";

export default function App() {
  // Variable storage list of provinces
  const [prefs, setPrefs] = useState(() => {
    const local_prefs = JSON.parse(localStorage.getItem("prefs"));
    return local_prefs || []; 
  });
  // Data displayed on the chart
  const [data, setData] = useState(() => {
    const local_data = JSON.parse(localStorage.getItem("data"));
    return local_data || [];
  });
  // The data which getted from the API
  const [saved, setSaved] = useState(() => {
    const local_saved = JSON.parse(localStorage.getItem("saved"));
    return local_saved || [];
  });
  // Storage checkbox which is checked
  const [checked, setChecked] = useState(() => {
    const local_checked = JSON.parse(localStorage.getItem("checked"));
    return local_checked || [];
  });
  // Call API to get list of provinces
  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`${PREFIX}/prefectures`, {
          headers: {
            "X-API-KEY": API_KEY,
          },
        })
        .then((response) => {
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
        .catch((e) => {
          console.log(e);
        });
    };
    if (prefs.length === 0) fetchData();
    localStorage.setItem("prefs", JSON.stringify(prefs));
    localStorage.setItem("data", JSON.stringify(data));
    localStorage.setItem("saved", JSON.stringify(saved));
    localStorage.setItem("checked", JSON.stringify(checked));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs, data, saved, checked]);

  /**
   * @Fuction : Fuction to handle event when click to checkbox
   * @Explain :
   *     + If that checkbox is not checked
   *       and that province data has not been saved
   *          => Call API to get population data of that province
   *     + Else, only change state of checkbox
   * @CreatedBy : Pham Tuan Dung - 28/09/2021
   * @ModifiedBy : Pham Tuan Dung - 28/09/2021
   */
  const handleOnChange = (position) => {
    var currentData = data;
    if (!checked[position - 1] && !saved[position - 1]) {
      axios
        .get(
          `${PREFIX}/population/composition/perYear?cityCode=-&prefCode=${prefs[position - 1].prefCode}`,
          {
            headers: {
              "X-API-KEY": API_KEY,
            },
          }
        )
        .then((response) => {
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
                item2[prefs[position - 1].prefName] = item1["value"];
              }
            });
          });
          setData([...currentData]);
          saved[position - 1] = true;
        })
        .catch((e) => {
          console.log(e);
        });
    }
    const updatedCheckedState = checked.map((item, index) =>
      index === position - 1 ? !item : item
    );
    setChecked(updatedCheckedState);
  };
  // Use useStae to set opacity line
  const [opacity, setOpacity] = useState({});
  /**
   * @Function : Handle event
   *    when the mouse pointer to the province name, blur that line.
   * @param {*} o
   * @CreatedBy : Pham Tuan Dung - 28/09/2021
   * @ModifiedBy : Pham Tuan Dung - 28/09/2021
   */
  const handleMouseEnter = (o) => {
    const { dataKey } = o;
    setOpacity({ ...opacity, [dataKey]: 0.5 });
  };
  /**
   * @Function : Handle event
   *    when removing the mouse pointer to the province name,
   *    removes the line blur effect.
   * @param {*} o
   * @CreatedBy : Pham Tuan Dung - 28/09/2021
   * @ModifiedBy : Pham Tuan Dung - 28/09/2021
   */

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
            <div className="pref-item" key={pref.prefCode}>
              <input
                type="checkbox"
                id={pref.prefCode}
                name={pref.prefName}
                value={pref.prefName}
                checked={checked[pref.prefCode - 1]}
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
            <XAxis
              dataKey="year"
              label={{
                value: "年度",
                position: "insideBottomRight",
                offset: 0,
              }}
              padding={{ left: 20, right: 60 }}
            />
            <YAxis
              label={{ value: "人口数", position: "insideTopLeft", offset: 0 }}
              padding={{ top: 60, left: 10 }}
            />
            <Tooltip />
            <Legend
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {prefs.map((pref) =>
              checked[pref.prefCode - 1] ? (
                <Line
                  type="monotone"
                  key={pref.prefCode}
                  dataKey={pref.prefName}
                  stroke={pref.color}
                  strokeOpacity={opacity[pref.prefName]}
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