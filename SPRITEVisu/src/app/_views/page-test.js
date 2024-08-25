'use client';

import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

const Heatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [hoverText, setHoverText] = useState([]);
    const [maxValue, setMaxValue] = useState(1);
    const canvasRef = useRef(null);

    const initialRangePoints = 1000; // Initial range in points
    const basesPerMB = 1000000; // 1 MB = 1,000,000 bases

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
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
                console.log(data.length);
                setHeatmapData(data.reverse());
            };
            reader.readAsText(file);
        }
    };


    const [layout, setLayout] = useState({
        autosize: true,
        width: 800,
        height: 800,
        title: 'Heatmap',
        dragmode: 'pan', // Enable panning
        xaxis: {
            title: 'X (MB)',
            range: [0, initialRangePoints / 2], // Initial zoom range for x-axis in points
            side: 'top' // Position x-axis ticks at the top
        },
        yaxis: {
            title: 'Y (MB)',
            range: [initialRangePoints / 2, 0], // Initial zoom range for y-axis in points
            autorange: 'reverse', // Reverse the y-axis
            side: 'left' // Position y-axis ticks at the left
        },
    });

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
            <input type="file" onChange={handleFileChange} />
            <Plot
                data={[
                    {
                        z: heatmapData,
                        type: 'heatmap', // Use WebGL heatmap for large datasets
                        colorscale: [
                            [0, 'white'],
                            [1, 'red']
                        ],
                        zmax: maxValue, // Ensure correct scaling for large datasets
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
            />
        </div>
    );
};

export default Heatmap;
