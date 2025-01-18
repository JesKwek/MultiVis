'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './heatmap.module.css';
import { convertFromBp, convertToBases } from '../Resources/Unit';
import { dnaConversion } from "@/Methods/DnaConversion";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const Heatmap = ({
    resolutionUnit,
    heatmapData,
    plotData,
    hoverText,
    updatePlotData,
    initialRangePoints,
    initialZoom,
    layout,
    setLayout,
    generateTickValues,
    xSliderStyle,
    setXSliderStyle,
    ySliderStyle,
    setYSliderStyle,
    virutalXMin,
    virutalYMin,
    xLength,
    yLength,
    xAxis,
    yAxis,

    setXStartLoc,
    xStartLocUnit,
    setXEndLoc,
    xEndLocUnit,

    setYStartLoc,
    yStartLocUnit,
    setYEndLoc,
    yEndLocUnit,
}) => {
    var [currXMin, setCurrXMin] = useState(0)
    var [currYMin, setCurrYMin] = useState(0)

    const handleRelayout = (event) => {
        let xRange = event['xaxis.range'] || layout.xaxis.range;
        let yRange = event['yaxis.range'] || layout.yaxis.range;

        // Calculate new data range and update plot data
        let xMin = xRange[0];
        let xMax = xRange[1];
        let yMin = yRange[1];
        let yMax = yRange[0];
        
        var isMovingRight = false;
        var isMovingDown = false;

        if (currXMin < xMin) {
            // console.log("MOVE RIGHT")
            isMovingRight = true;
            setCurrXMin(xMin)
        } else {
            // console.log("MOVE LEFT")
            isMovingRight = false;
            setCurrXMin(xMin)
        }

        if (currYMin < yMin) {
            // console.log("MOVE DOWN")
            isMovingDown = true
            setCurrYMin(yMin)
        } else {
            // console.log("MOVE UP")
            isMovingDown = false
            setCurrYMin(yMin)
        }

        const maxRangeDifference = initialRangePoints / 9;

        // Ensure the zoom is always square
        const xRangeDifference = xMax - xMin;
        const yRangeDifference = yMax - yMin;

        if (xRangeDifference > yRangeDifference) {
            yMax = yMin + xRangeDifference;
        } else {
            xMax = xMin + yRangeDifference;
        }

        // Enforce the max range difference
        if (xMax - xMin > maxRangeDifference) {
            xMax = xMin + maxRangeDifference;
            yMax = yMin + maxRangeDifference;
        }
        
        if (xMax >= (initialZoom * 7) || yMax >= (initialZoom * 7) || xMax <= (initialZoom * 3) || yMax <= (initialZoom * 3)) {
            const newAxis = updatePlotData(resolutionUnit, heatmapData, xMin, xMax, yMin, yMax, isMovingRight, isMovingDown);

            const newXRange = [newAxis.viewXMin, newAxis.viewXMax];
            var newYRange = [newAxis.viewYMax, newAxis.viewYMin];

            setCurrXMin(newAxis.viewXMin)
            setCurrYMin(newAxis.viewYMin)

            const xTicks = generateTickValues(initialRangePoints, 'x', newAxis.xMin, newAxis.yMin);
            const yTicks = generateTickValues(initialRangePoints, 'y', newAxis.xMin, newAxis.yMin);
    
            setLayout(prevLayout => ({
                ...prevLayout,
                xaxis: {
                    ...prevLayout.xaxis,
                    range: newXRange,
                    tickvals: xTicks.tickVals,
                    ticktext: xTicks.tickTexts,
                },
                yaxis: {
                    ...prevLayout.yaxis,
                    range: newYRange,
                    tickvals: yTicks.tickVals,
                    ticktext: yTicks.tickTexts,
                },
            }));
        }

        setXSliderStyle({
            left: `${(xMin+virutalXMin)/xLength*100}%`,
            width: `${(xRangeDifference/xLength)*100}%`
        })

        setYSliderStyle({
            top: `${(yMin+virutalYMin)/yLength*100}%`,
            height: `${(yRangeDifference/yLength)*100}%`
        })

        // For Right Side Bar: Convert the current start and end
        var axisUnit = localStorage.getItem("axisUnit");
        if (axisUnit == null) {
            axisUnit = "Mb"
        };

        const pointsPerUnit = +localStorage.getItem("pointsPerUnit");

        let startXInBP = ((xMin+virutalXMin) * pointsPerUnit)
        let endXInBP = ((xMax+virutalXMin) * pointsPerUnit)
        let startYInBP = ((yMin+virutalYMin) * pointsPerUnit)
        let endYInBP = ((yMax+virutalYMin) * pointsPerUnit)

        setXStartLoc( convertFromBp(startXInBP, xStartLocUnit).toFixed(2));

        if ((endXInBP - startXInBP) > 5000000) {
            setXEndLoc(convertFromBp((startXInBP + 4800000), xStartLocUnit).toFixed(2));
        } else {
            setXEndLoc(convertFromBp(endXInBP, xEndLocUnit).toFixed(2));
        }

        setYStartLoc(convertFromBp(startYInBP, yStartLocUnit).toFixed(2));

        if ((endYInBP - startYInBP) > 5000000) {
            setYEndLoc(convertFromBp((startYInBP + 4800000), yStartLocUnit).toFixed(2));
        } else {
            setYEndLoc(convertFromBp(endYInBP, yEndLocUnit).toFixed(2));
        }
        

    };

    return (
        <div style={{ width: '900px', height: '900px'}}>
            <div className={styles.chromXDiv}>
                <div className={styles.xSlider} style={xSliderStyle}></div>
                <p>{xAxis}</p>
            </div>
            <div className={styles.chromYDiv}>
            <div className={styles.ySlider} style={ySliderStyle}></div>
                <p>{yAxis}</p>
            </div>
            <Plot
                data={[
                    {
                        z: plotData,
                        type: 'heatmap',
                        colorscale: [
                            [0, 'white'],
                            [0.5, 'red'],
                            [1, 'black']
                        ],
                        zmax: localStorage.getItem("heatmapVMax"),
                        zmin: 0,
                        hoverinfo: 'text',
                        text: hoverText
                    },
                ]}
                style={{ width: '100%', height: '100%' }}
                layout={layout}
                config={{
                    responsive: true,
                    scrollZoom: false,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['resetScale2d', 'autoscale']
                }}
                onRelayout={handleRelayout}
            />
        </div>
    );
};

export default Heatmap;
