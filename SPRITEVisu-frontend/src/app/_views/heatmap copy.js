'use client';

import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

const Heatmap = ({filepath, setIsLoading}) => {
    const plotRef = useRef(null);
    const [plotInstance, setPlotInstance] = useState(null);

    const [heatmapData, setHeatmapData] = useState([]);
    const [plotData, setPlotData] = useState([]);
    const [hoverText, setHoverText] = useState([]);
    const [maxValue, setMaxValue] = useState(1);
    const canvasRef = useRef(null);

    const initialRangePoints = 2000; // Initial range in points
    const initialZoom = initialRangePoints / 9;
    const basesPerMB = 1000000; // 1 MB = 1,000,000 bases
    const pointsPerMB = basesPerMB / 25000; // 1 point = 25,000 bases (25 KB)

    // Track
    const [virutalXMin, setVirutalXMin] = useState(0);
    const [virutalXMax, setVirutalXMax] = useState(0);
    const [virutalYMin, setVirutalYMin] = useState(0);
    const [virutalYMax, setVirutalYMax] = useState(0);

    useEffect(() => {
        handleFileChange(filepath);
    }, [filepath])

    const handleFileChange = (file) => {
        if (file) {
            console.log("Load file")
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const rows = text.trim().split('\n');
                const data = [];
                let maxVal = -Infinity;

                for (let row of rows) {
                    const values = row.split('\t').map(Number);
                    data.push(values);
                    for (let value of values) {
                        if (value > maxVal) {
                            maxVal = value;
                        }
                    }
                }

                setMaxValue(maxVal);
                setHeatmapData(data); // Reverse the order of the data
                updatePlotData(data, 0, initialRangePoints, 0, initialRangePoints); // Initial plot data (first 100x100)
            };
            reader.readAsText(file);
        }
    };

    const updatePlotData = (data, xMin, xMax, yMin, yMax) => {
        // Ensure the ranges do not exceed the data dimensions
        const maxXData = data[0].length;
        const maxYData = data.length;

        if (xMin != 0 ){
            const newXMin = xMin - (initialZoom * 4) + virutalXMin;
            xMin = newXMin
            setVirutalXMin(xMin)
        }

        if (xMax != initialRangePoints) {
            const newXMax = xMax + (initialZoom * 4) + virutalXMax;
            xMax = newXMax
            setVirutalXMax(xMax - initialRangePoints)
        }

        if (yMin != 0 ){
            const newYMin = yMin - (initialZoom * 4) + virutalYMin;
            yMin = newYMin
            setVirutalYMin(yMin)
        }

        if (yMax != initialRangePoints) {
            const newYMax = yMax + (initialZoom * 4) + virutalYMax;
            yMax = newYMax
            setVirutalYMax(yMax - initialRangePoints)
        }

        console.log(`xMin ${xMin}, xMax ${xMax}`);
        console.log(`yMin ${yMin}, yMax ${yMax}`);

        const subset = data.slice(yMin, yMax).map(row => row.slice(xMin, xMax));
        console.log(subset.length)
        // Generate hovertext with converted MB values
        const hoverText = subset.map((row, rowIndex) => 
            row.map((value, colIndex) => 
                `X: ${((colIndex + xMin) * 25000 / basesPerMB).toFixed(2)} MB<br>Y: ${((rowIndex + yMin )* 25000 / basesPerMB).toFixed(2)} MB<br>Value: ${value}`
            )
        );

        setPlotData(subset);
        setHoverText(hoverText);
        return { xMin, xMax, yMin, yMax }
    };

    const handleRelayout = (event) => {
        let xRange = event['xaxis.range'] || layout.xaxis.range;
        let yRange = event['yaxis.range'] || layout.yaxis.range;

        // Calculate new data range and update plot data
        let xMin = xRange[0];
        let xMax = xRange[1];
        let yMin = yRange[1];
        let yMax = yRange[0];

        if (xMax >= (initialZoom *7) || yMax >= (initialZoom * 7)) {
            console.log("Load new subset of heatmap")

            // New View Area
            const newAxis = updatePlotData(heatmapData, xMin, xMax, yMin, yMax);

            const currentXMin = xMin
            const currentXMax = xMax
            const currentYMin = yMin
            const currentYMax = yMax

            const newXRange = [currentXMin - (initialZoom * 2), currentXMax - (initialZoom * 2)];
            const newYRange = [currentYMax - (initialZoom * 2), currentYMin - (initialZoom * 2)];

            console.log(virutalYMin);
            const xTicks = generateTickValues(initialRangePoints, pointsPerMB, 'x', newAxis.xMin, newAxis.yMin);
            const yTicks = generateTickValues(initialRangePoints, pointsPerMB, 'y', newAxis.xMin, newAxis.yMin);
    
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
    };

    const generateTickValues = (maxValue, pointsPerMB, axis, minX, minY) => {
        const tickVals = [];
        const tickTexts = [];
        for (let i = 0; i <= maxValue; i += pointsPerMB) {
            tickVals.push(i);
            if (axis === 'x') {
                // Only label even ticks for x-axis
                tickTexts.push((i) % (pointsPerMB * 2) === 0 ? `${((((i + minX) * 25000) / basesPerMB).toFixed(2))} MB` : ' ');
            } else {
                // Only label even ticks for y-axis
                tickTexts.push((i) % (pointsPerMB * 2) === 0 ? `${(((((i + minY)) * 25000) / basesPerMB).toFixed(2))} MB` : ' ');
            }
        }
        return { tickVals, tickTexts };
    };

    const xTicks = generateTickValues(initialRangePoints, pointsPerMB, 'x', 0, 0);
    const yTicks = generateTickValues(initialRangePoints, pointsPerMB, 'y', 0, 0);

    const [layout, setLayout] = useState({
        autosize: true,
        width: 800,
        height: 800,
        dragmode: 'pan', // Enable panning
        xaxis: {
            // title: {
            //     text: 'X (MB)',
            //     standoff: 40, // Distance between the title and the axis
            // },
            range: [virutalXMin, initialZoom], // Initial zoom range for x-axis in points
            tickvals: xTicks.tickVals,
            ticktext: xTicks.tickTexts,
            side: 'top' // Position x-axis ticks at the top
        },
        yaxis: {
            // title: {
            //     text: 'Y (MB)',
            //     standoff: 80, // Distance between the title and the axis
            // },
            range: [initialZoom, virutalYMin], // Initial zoom range for y-axis in points
            tickvals: yTicks.tickVals,
            ticktext: yTicks.tickTexts,
            side: 'left', // Position y-axis ticks at the left
        },
    });

    const handleInitialized = (figure, graphDiv) => {
        setPlotInstance(graphDiv);
    };

    useEffect(() => {
        if (canvasRef.current) {
            setLayout((prevLayout) => ({
                ...prevLayout,
                width: canvasRef.current.offsetWidth,
                height: canvasRef.current.offsetHeight,
            }));
        }
    }, [canvasRef.current]);

    return (
        <div ref={canvasRef} style={{ width: '800px', height: '800px' }}>
            <Plot
                ref={plotRef}
                data={[
                    {
                        z: plotData,
                        type: 'heatmap',
                        colorscale: [
                            [0, 'white'],
                            [1, 'red']
                        ],
                        zmax: maxValue,
                        zmin: 0,
                        hoverinfo: 'text',
                        text: hoverText
                    },
                ]}
                layout={layout}
                config={{
                    responsive: true,
                    scrollZoom: true, // Enable zooming via scroll
                    displayModeBar: true,
                    displaylogo: false,
                }}
                onRelayout={handleRelayout}
                onInitialized={handleInitialized}
            />
        </div>
    );
};

export default Heatmap;
