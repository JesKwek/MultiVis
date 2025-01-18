'use client';

import Sidebar from "@/components/Sidebar/Sidebar";
import Heatmap from "./_views/heatmap";
import style from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { dnaConversion } from "@/Methods/DnaConversion";
import LoadingModal from "@/components/LoadingModal/LoadingModal";
import { convertToBases, isWholeNumberWithNoDecimal } from "./Resources/Unit";
import RightSidebar from "@/components/RightSidebar/RightSidebar";

const Home = () => {
    // Setting Parameters:
    const [resolution, setResolution] = useState(null);
    const [resolutionUnit, setResolutionUnit] = useState('Mb');

    // Contact Matrix Properties
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");

    // Heatmaps:
    const [heatmapData, setHeatmapData] = useState([]); // The full heatmap data without subset
    const [plotData, setPlotData] = useState([[0]]); // The subset data. This is to prevent ploty for crashing.
    const [hoverText, setHoverText] = useState([]);
    const [xLength, setXLength] = useState(0);
    const [yLength, setyLength] = useState(0);

    const [actualMinDataValue, setActualMinDataValue] = useState(0);
    const [actualMaxDataValue, setActualMaxDataValue] = useState(1);

    // For data extracting and initial zoom.
    //// Initial range in points and the range of data to be subsetted.
    const [initialRangePoints, setInitialRangePoints] = useState(1998);
    const [initialZoom, setInitialZoom] = useState(initialRangePoints / 9);

    // Virutal is the subset of the actutal data and not the whole data
    const [virutalXMin, setVirutalXMin] = useState(0);
    const [virutalXMax, setVirutalXMax] = useState(initialRangePoints);
    const [virutalYMin, setVirutalYMin] = useState(0);
    const [virutalYMax, setVirutalYMax] = useState(initialRangePoints);

    // Right Side Bar
    const [xStartLoc, setXStartLoc] = useState('0');
    const [xStartLocUnit, setXStartLocUnit] = useState('Mb');
    const [xEndLoc, setXEndLoc] = useState('1');
    const [xEndLocUnit, setXEndLocUnit] = useState('Mb');

    const [yStartLoc, setYStartLoc] = useState('0');
    const [yStartLocUnit, setYStartLocUnit] = useState('Mb');
    const [yEndLoc, setYEndLoc] = useState('1');
    const [yEndLocUnit, setYEndLocUnit] = useState('Mb');

    var [xSliderStyle, setXSliderStyle] = useState({
        left: "0%",
        width: "10%"
    });

    var [ySliderStyle, setYSliderStyle] = useState({
        top: "0%",
        height: "10%"
    });

    const [isLoading, setIsLoading] = useState(false);

    /**
    * Resets the heatmap layout and chromosome sliders to the default position (0,0) 
    * and initial zoom level. Adjusts the x and y sliders back to 0% and updates 
    * the layout properties accordingly.
    */
    const reset = (initialZoom) => {
        setXSliderStyle({
            left: '0%',
            width: `${(initialZoom/xLength)*100}%`
        });

        setYSliderStyle({
            top: '0%',
            height: `${(initialZoom/yLength)*100}%`
        });

        setLayout({
            autosize: true,
            dragmode: 'pan',
            margin: {
                l: 120,
                r: 0,
                t: 120,
            },
            xaxis: {
                range: [0, initialZoom],
                tickvals: xTicks.tickVals,
                ticktext: xTicks.tickTexts,
                side: 'top',
                tickangle: 0
            },
            yaxis: {
                range: [initialZoom, 0],
                tickvals: yTicks.tickVals,
                ticktext: yTicks.tickTexts,
                side: 'left',
                tickangle: 0
            },
        })
    };

    const onApply = (resolutionInBp, resolutionUnit, result) => {
        setActualMinDataValue(result['min_value']);
        setActualMaxDataValue(result['max_value']);
        setInitialZoom(+localStorage.getItem("gridSize"));
        setVirutalXMax(+localStorage.getItem("gridSize") * 9);
        setVirutalYMax(+localStorage.getItem("gridSize") * 9);
        setInitialRangePoints(+localStorage.getItem("gridSize") * 9);
        reset(+localStorage.getItem("gridSize"));

        loadFile('Mb');
    }

    const loadFile = (resolutionUnit) => {
        const fetchFile = async () => {
            setIsLoading(true);
    
            try {
                const response = await fetch("matrix.txt");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const blob = await response.blob();
    
                processFileBlob(blob); // Process directly from the blob
            } catch (error) {
                console.error('Error fetching file:', error);
            }
    
            setIsLoading(false);
        };
    
        const processFileBlob = (blob) => {
            const chunkSize = 1024 * 1024; // 1 MB chunks
            let offset = 0;
            let completeData = [];
            let leftover = ''; // To store incomplete lines between chunks
            const reader = new FileReader();
    
            reader.onload = (event) => {
                const chunk = event.target.result;
                processChunk(chunk);
            };
    
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
            };
    
            const readNextChunk = () => {
                if (offset >= blob.size) {
                    if (leftover) {
                        // Process any remaining data in leftover
                        const rows = leftover.trim().split('\n');
                        const chunkData = rows.map(row => row.split('\t').map(Number));
                        completeData = completeData.concat(chunkData);
                    }
                    finalizeDataProcessing();
                    return;
                }
    
                const slice = blob.slice(offset, offset + chunkSize);
                reader.readAsText(slice);
                offset += chunkSize;
            };
    
            const processChunk = (chunk) => {
                const chunkText = leftover + chunk; // Prepend leftover from the previous chunk
                const rows = chunkText.split('\n');
                leftover = rows.pop(); // Store the last incomplete line to prepend to the next chunk
    
                const chunkData = rows.map(row => row.split('\t').map(Number));
                completeData = completeData.concat(chunkData);
    
                // Schedule the next chunk read
                setTimeout(readNextChunk, 0); // Use setTimeout to avoid blocking the event loop
            };
    
            const finalizeDataProcessing = () => {
                if (completeData.length > 0) {
                    setHeatmapData(completeData);
                    setXLength(completeData[0]?.length || 0);
                    setyLength(completeData.length);
                    updatePlotData(resolutionUnit, completeData, 0, initialRangePoints, 0, initialRangePoints);
                    setupHeatmapLayout(resolutionUnit);
    
                    setXSliderStyle({
                        left: '0%',
                        width: `${(initialZoom / (completeData[0]?.length || 0)) * 100}%`
                    });
    
                    setYSliderStyle({
                        top: '0%',
                        height: `${(initialZoom / completeData.length) * 100}%`
                    });
                } else {
                    // Handle the error.
                    console.error("Complete data is empty after processing.");
                }
            };
    
            // Start reading the first chunk
            readNextChunk();
        };
    
        fetchFile();
    };
    
    
    


    const updatePlotData = (resolutionUnit, data, xMin, xMax, yMin, yMax, isMovingRight, isMovingDown) => {
        // Ensure the ranges do not exceed the data dimensions
        var viewXMin = xMin;
        var viewXMax = xMax;
        var viewYMin = yMin;
        var viewYMax = yMax;

        // Finding the actutal data subset.
        const subsetValue = (initialZoom * 4)
        //// This calculation is used when it move down or right
        var newXMax = xMax + subsetValue + virutalXMax - initialRangePoints;
        var isXReachTheEnd = (newXMax >= xLength)
    
        var newYMax = yMax + subsetValue + virutalYMax - initialRangePoints;
        var isYReachTheEnd = (newYMax >= yLength)

        //// This calculation is used when it move up or left
        var newXMin = xMin - subsetValue + virutalXMax - initialRangePoints;
        var isXAtTheStart = (newXMin <= 0)

        var newYMin = yMin - subsetValue + virutalYMax - initialRangePoints;
        var isYAtTheStart = (newYMin <= 0)
    
        // Helper function to handle x-axis updates
        const handleXAxis = () => {
            if (xMin !== 0) {
                if (isMovingRight && isXReachTheEnd) {
                    viewXMin = Math.floor(xMin);
                    xMin = xLength - initialRangePoints - 1;
                    setVirutalXMin(xMin);
                } else if (!isMovingRight && isXAtTheStart) {
                    viewXMin = Math.floor(xMin);
                    xMin = 0;
                    setVirutalXMin(xMin);
                } else if (isMovingRight) {
                    if (xMax > initialZoom * 7) {
                        viewXMin = Math.floor(xMin - initialZoom * 2);
                        xMin = Math.floor(xMin - subsetValue + virutalXMin);
                        setVirutalXMin(xMin);
                    } else {
                        viewXMin = Math.floor(xMin);
                        xMin = virutalXMin
                        setVirutalXMin(xMin);
                    }
                } else if (!isMovingRight) {
                    if (xMax < initialZoom * 3) {
                        viewXMin = Math.floor(xMin + initialZoom * 2);
                        xMin = Math.floor(xMin - subsetValue + virutalXMin - 1);
                        setVirutalXMin(xMin);
                    } else {
                        viewXMin = Math.floor(xMin);
                        xMin = virutalXMin
                        setVirutalXMin(xMin);
                    }
                } 
            }
    
            if (xMax !== initialRangePoints) {
                if (isMovingRight && isXReachTheEnd) {
                    viewXMax = Math.floor(xMax);
                    xMax = xLength - 1;
                    setVirutalXMax(xMax);
                } else if (!isMovingRight && isXAtTheStart) {
                    viewXMax = Math.floor(xMax);
                    xMax = initialRangePoints;
                    setVirutalXMax(xMax);
                } else if (isMovingRight) {
                    if (xMax > initialZoom * 7) {
                        viewXMax = Math.floor(xMax - initialZoom * 2);
                        xMax = Math.floor(newXMax);
                        setVirutalXMax(xMax);
                    } else {
                        viewXMax = Math.floor(xMax);
                        xMax = virutalXMax
                        setVirutalXMax(xMax);
                    }
                } else if (!isMovingRight) {
                    if (xMax < initialZoom * 3) {
                        viewXMax = Math.floor(xMax + initialZoom * 2);
                        xMax = Math.floor(newXMax);
                        setVirutalXMax(xMax);
                    } else {
                        viewXMax = Math.floor(xMax);
                        xMax = virutalXMax
                        setVirutalXMax(xMax);
                    }
                }
            }
        };
    
        // Helper function to handle y-axis updates
        const handleYAxis = () => {
            if (yMin !== 0) {
                if (isMovingDown && isYReachTheEnd) {
                    viewYMin = Math.floor(yMin);
                    yMin = yLength - initialRangePoints - 1;
                    setVirutalYMin(yMin);
                } else if (!isMovingDown && isYAtTheStart) {
                    viewYMin = Math.floor(yMin);
                    yMin = 0;
                    setVirutalYMin(yMin);
                } else if (isMovingDown) {
                    if (yMax > initialZoom * 7) {
                        viewYMin = Math.floor(yMin - initialZoom * 2);
                        yMin = Math.floor(yMin - subsetValue + virutalYMin - 1);
                        setVirutalYMin(yMin);
                    } else {
                        viewYMin = Math.floor(yMin);
                        yMin = virutalYMin
                        setVirutalYMin(yMin);
                    }
                } else if (!isMovingDown) {
                    if (yMax < initialZoom * 3) {
                        viewYMin = Math.floor(yMin + initialZoom * 2);
                        yMin = Math.floor(yMin - subsetValue + virutalYMin - 1);
                        setVirutalYMin(yMin);
                    } else {
                        viewYMin = Math.floor(yMin);
                        yMin = virutalYMin
                        setVirutalYMin(yMin);
                    }
                }
            }
    
            if (yMax !== initialRangePoints) {
                if (isMovingDown && isYReachTheEnd) {
                    viewYMax = Math.floor(yMax);
                    yMax = yLength - 1;
                    setVirutalYMax(yMax);
                } else if (!isMovingDown && isYAtTheStart) {
                    viewYMax = Math.floor(yMax);
                    yMax = initialRangePoints
                    setVirutalYMax(yMax);
                } else if (isMovingDown) {
                    if (yMax > initialZoom * 7) {
                        viewYMax = Math.floor(yMax - initialZoom * 2);
                        yMax = Math.floor(newYMax);
                        setVirutalYMax(yMax);
                    } else {
                        viewYMax = Math.floor(yMax);
                        yMax = virutalYMax
                        setVirutalYMax(yMax);
                    }
                } else if (!isMovingDown) {
                    if (yMax < initialZoom * 3) {
                        viewYMax = Math.floor(yMax + initialZoom * 2);
                        yMax = Math.floor(newYMax);
                        setVirutalYMax(yMax);
                    } else {
                        viewYMax = Math.floor(yMax);
                        yMax = virutalYMax
                        setVirutalYMax(yMax);
                    }
                }
            }
        };
    
        // Update axis values
        handleXAxis();
        handleYAxis();
    
        const subset = data.slice(yMin, yMax).map(row => row.slice(xMin, xMax));

        var axisUnit = localStorage.getItem("axisUnit");
        if (axisUnit == null) {
            axisUnit = "Mb"
        }

        const bpPerUnit = dnaConversion.convert(1, axisUnit);
        const pointsPerUnit = +localStorage.getItem("pointsPerUnit");
        
    
        // Generate hovertext with converted MB values
        const hoverText = subset.map((row, rowIndex) =>
            row.map((value, colIndex) =>
                `X: ${((colIndex + xMin) * pointsPerUnit / bpPerUnit).toFixed(2)} ${axisUnit}<br>Y: ${((rowIndex + yMin) * pointsPerUnit / bpPerUnit).toFixed(2)} ${axisUnit}<br>Value: ${value}`
            )
        );
    
        setPlotData(subset);
        setHoverText(hoverText);
        return { viewXMin, xMin, viewXMax, xMax, viewYMin, yMin, viewYMax, yMax }
    };    

    const setupHeatmapLayout = (resolutionUnit) => {
        const xTicks = generateTickValues(initialRangePoints, 'x', 0, 0);
        const yTicks = generateTickValues(initialRangePoints, 'y', 0, 0);

        setLayout(prevLayout => ({
            ...prevLayout,
            xaxis: {
                ...prevLayout.xaxis,
                tickvals: xTicks.tickVals,
                ticktext: xTicks.tickTexts,
            },
            yaxis: {
                ...prevLayout.yaxis,
                tickvals: yTicks.tickVals,
                ticktext: yTicks.tickTexts,
            },
        }));
    };

    const generateTickValues = (maxValue, axis, minX, minY) => {
        const tickVals = [];
        const tickTexts = [];
        var axisUnit = localStorage.getItem("axisUnit");
        if (axisUnit == null) {
            axisUnit = "Mb"
        }
        var bpPerAxis = +localStorage.getItem("bpPerAxis");
        if (bpPerAxis == 0) {
            bpPerAxis = 1
        }
        const bpPerUnit = dnaConversion.convert(1, axisUnit);
        const pointsPerUnit = +localStorage.getItem("pointsPerUnit");
    
        for (let i = 0; i <= maxValue; i += 1) {
    
            if (axis === 'x') {
                // Only label even ticks for x-axis
                // basesPerUnit is the unit required to be coverted to. For example, bp to MB
                // pointsPerUnit is the resolution.
                const basesWithDeci = ((i + minX) * pointsPerUnit) / bpPerUnit
                const bases = (basesWithDeci.toFixed(0));
    
                if (isWholeNumberWithNoDecimal(bases) && (basesWithDeci % bpPerAxis == 0)) {
                    tickVals.push(i);
                    tickTexts.push(`${bases} ${axisUnit}`);
                }
            } else {
                // Only label even ticks for y-axis
                const basesWithDeci = ((i + minY) * pointsPerUnit) / bpPerUnit
                const bases = (basesWithDeci.toFixed(0));
    
                if (isWholeNumberWithNoDecimal(bases) && (basesWithDeci % bpPerAxis == 0)) {
                    tickVals.push(i);
                    tickTexts.push(`${bases} ${axisUnit}`);
                }
            }
        }
        return { tickVals, tickTexts };
    };

    const xTicks = generateTickValues(initialRangePoints, 'x', 0, 0);
    const yTicks = generateTickValues(initialRangePoints, 'y', 0, 0);

    const [layout, setLayout] = useState({
        autosize: true,
        dragmode: 'pan',
        margin: {
            l: 120, // left margin
            r: 0,
            t: 120, // top margin
        },
        xaxis: {
            range: [0, initialZoom],
            tickvals: xTicks.tickVals,
            ticktext: xTicks.tickTexts,
            side: 'top',
            tickangle: 0
        },
        yaxis: {
            range: [initialZoom, 0],
            tickvals: yTicks.tickVals,
            ticktext: yTicks.tickTexts,
            side: 'left',
            tickangle: 0
        },
    });

    return (
        <>
            <Sidebar
                xAxis={xAxis}
                setXAxis={setXAxis}
                yAxis={yAxis}
                setYAxis={setYAxis}
                onApply={onApply}
                setIsLoading={setIsLoading}
            />
            <main className={style.main}>
                <Heatmap
                    resolutionUnit={resolutionUnit}
                    heatmapData={heatmapData}
                    plotData={plotData}
                    hoverText={hoverText}
                    updatePlotData={updatePlotData}
                    initialZoom={initialZoom}
                    initialRangePoints={initialRangePoints}
                    layout={layout}
                    setLayout={setLayout}
                    generateTickValues={generateTickValues}
                    xSliderStyle={xSliderStyle}
                    setXSliderStyle={setXSliderStyle}
                    ySliderStyle={ySliderStyle}
                    setYSliderStyle={setYSliderStyle}
                    virutalXMin={virutalXMin}
                    virutalYMin={virutalYMin}
                    xLength={xLength}
                    yLength={yLength}
                    xAxis={xAxis}
                    yAxis={yAxis}

                    setXStartLoc={setXStartLoc}
                    xStartLocUnit={xStartLocUnit}
                    setXEndLoc={setXEndLoc}
                    xEndLocUnit={xEndLocUnit}

                    setYStartLoc={setYStartLoc}
                    yStartLocUnit={yStartLocUnit}
                    setYEndLoc={setYEndLoc}
                    yEndLocUnit={yEndLocUnit}
                />
                <RightSidebar
                    xStartLoc={xStartLoc}
                    setXStartLoc={setXStartLoc}
                    xStartLocUnit={xStartLocUnit}
                    setXStartLocUnit={setXStartLocUnit}
                    xEndLoc={xEndLoc}
                    setXEndLoc={setXEndLoc}
                    xEndLocUnit={xEndLocUnit}
                    setXEndLocUnit={setXEndLocUnit}

                    yStartLoc={yStartLoc}
                    setYStartLoc={setYStartLoc}
                    yStartLocUnit={yStartLocUnit}
                    setYStartLocUnit={setYStartLocUnit}
                    yEndLoc={yEndLoc}
                    setYEndLoc={setYEndLoc}
                    yEndLocUnit={yEndLocUnit}
                    setYEndLocUnit={setYEndLocUnit}
                />
            </main>
            <LoadingModal open={isLoading} />
        </>
    )
};

export default Home;