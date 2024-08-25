import Logo from "../Logo/Logo";
import CustomDropdown from "./views/dropdown";
import style from "./Sidebar.module.css";
import { useEffect, useState } from "react";
import { convertToBases } from "@/app/Resources/Unit";
import { dnaConversion } from "@/Methods/DnaConversion";

const { Drawer, Toolbar, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } = require("@mui/material")

const getChromosomeNumber = chromosome => parseInt(chromosome.replace('chr', ''));

const Sidebar = ({
    xAxis,
    setXAxis,
    yAxis,
    setYAxis,
    onApply,
    setIsLoading
}) => {
    const DRAWER_WIDTH = 320;

    const [directoryName, setDirectoryName] = useState(null);
    const [dataFiles, setDataFiles] = useState(null);

    // Matrix Properties
    const [chromosomes, setChromosomes] = useState([]);
    const [resolution, setResolution] = useState('25');
    const [resolutionUnit, setResolutionUnit] = useState('Kb');
    const [outputType, setOutputType] = useState('final');
    const [iterations, setIterations] = useState('100');
    const [downweighting, setDownweighting] = useState('two_over_n');
    
    // Heatmap Properties
    const [heatmapVMin, setHeatmapVMin] = useState(0);
    const [heatmapVMax, setHeatmapVMax] = useState(1);
    const [axisUnit, setAxisUnit] = useState("Mb");
    const [axisValuePerUnit, setAxisValuePerUnit] = useState("1");

    const handleDirectorySelection = (event) => {
        const files = event.target.files;
        const directories = {};
        var data = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pathParts = file.webkitRelativePath.split('/');
            const dirName = pathParts.slice(0, -1).join('/');

            if (!directories[dirName]) {
                directories[dirName] = [];
            }
            directories[dirName].push(file);
        }


        Object.keys(directories).forEach(dirName => {
            data = directories[dirName];
            setDataFiles(directories[dirName]);
            setDirectoryName(dirName + '/')
        });

        loadMetaData(data);
    };

    const loadMetaData = async (data) => {
        setDataFiles(data)
        const file = data.filter((file) => file.name === 'meta.json')[0];

        if (file == undefined) {
            console.log('HANDLE ERROR: Unable to process. Missing meta.json');
            return;
        }

        const formData = new FormData();
        formData.append('files', file, file.webkitRelativePath);

        try {
            const response = await fetch('http://0.0.0.0:5000/meta', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            const resultJSON = JSON.parse(result)["chromosomes"];
            console.log(resultJSON);
            setChromosomes(Object.keys(resultJSON));
            console.log('Upload result:', result["chromosomes"]);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }

    const handleApplyButton = async () => {
        const bp = dnaConversion.convert(resolution, resolutionUnit);

        // Why use local storage. Seems like that is an issues with the 
        // useState.
        localStorage.setItem("heatmapVMin", heatmapVMin);
        localStorage.setItem("heatmapVMax", heatmapVMax);
        localStorage.setItem("pointsPerUnit", bp);
        localStorage.setItem("axisUnit", axisUnit);
        localStorage.setItem("bpPerAxis", axisValuePerUnit);

        // Find out file name
        const xAxisLower = xAxis.toLowerCase();
        const yAxisLower = yAxis.toLowerCase();
        var filename = `${xAxisLower}-${yAxisLower}.txt`;

        if (getChromosomeNumber(xAxisLower) > getChromosomeNumber(yAxisLower)) {
            filename = `${yAxisLower}-${xAxisLower}.txt`;
        };

        // Search for file
        const formData = new FormData();
        const file = dataFiles.filter((file) => file.name === 'meta.json')[0];
        const chr = dataFiles.filter((file) => file.name === filename)[0];

        formData.append('meta', file, file.webkitRelativePath);
        formData.append('chr', chr, chr.webkitRelativePath)
        formData.append('xAxis', xAxis);
        formData.append('yAxis', yAxis);
        formData.append('resolution', dnaConversion.convert(resolution, resolutionUnit));
        formData.append('output-type', outputType);
        formData.append('ice-iteration', iterations);
        formData.append('down-weighting', downweighting);

        setIsLoading(true);

        try {
            const response = await fetch('http://0.0.0.0:5000/matrix', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            onApply(bp, resolutionUnit, result);
            setIsLoading(false);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }

    const menuItems = xAxis !== yAxis 
    ? [{ value: 'raw', label: 'Raw' }] 
    : [
        { value: 'final', label: 'Final' },
        { value: 'iced', label: 'ICE' },
        { value: 'raw', label: 'Raw' }
      ];

    return (
        <Drawer
            variant="permanent"
            style={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
            }}
            PaperProps={{ style: { width: DRAWER_WIDTH } }}
        >
            <Logo />

            {/* TOP DROP DOWN */}
            <div className={style.dropdownContainer}>
                <CustomDropdown isHeatmap={true} />
            </div>

            {/* IMPORT FILL */}
            <div className={style.parameterSelections}>
                <div className={style.importSecion}>
                    <div className={style.directoryContainer}>
                        <p className={style.title}>Import Data</p>
                    </div>
                    <div className={style.importDataDiv}>
                        <input
                            type="file"
                            id="file-input"
                            directory="" webkitdirectory=""
                            className={style.fileInput}
                            onChange={handleDirectorySelection}
                        />
                        <label htmlFor="fileInput" className={style.customFileInput}>
                            {directoryName === null ? "Add data path" : directoryName}
                        </label>
                    </div>
                </div>

                <div className={style.dataPropertiesContainer}>
                    <p className={style.title}>Contact Matrix Properties</p>

                    {/* X and Y Axis */}
                    <div className={style.chrSelectionDiv}>
                        <FormControl variant="filled" sx={{ minWidth: '50%' }}>
                            <InputLabel id="x-unit-label" sx={{ fontSize: '12px' }}>X-Axis</InputLabel>
                            <Select
                                value={xAxis}
                                id="x-unit-label"
                                onChange={(e) => { 
                                    setXAxis(e.target.value) 

                                    if (yAxis != e.target.value) {
                                        setOutputType("raw")
                                    } else {
                                        setOutputType("final")
                                    }
                                }}
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    borderBottom: 'none',
                                    m: 0,
                                    '&:before': {
                                        borderBottom: 'none',
                                    },
                                    '&:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                }}
                            >

                                {chromosomes.map((key) => (
                                    <MenuItem key={key} value={key} sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>
                                        {key}
                                    </MenuItem>
                                ))}

                            </Select>
                        </FormControl>

                        <FormControl variant="filled" sx={{ minWidth: '50%' }}>
                            <InputLabel id="y-unit-label" sx={{ fontSize: '12px' }}>Y-Axis</InputLabel>
                            <Select
                                value={yAxis}
                                id="resolution-bases-unit"
                                onChange={(e) => { 
                                    setYAxis(e.target.value) 

                                    if (xAxis != e.target.value) {
                                        setOutputType("raw")
                                    } else {
                                        setOutputType("final")
                                    }
                                }}
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    borderBottom: 'none',
                                    '&:before': {
                                        borderBottom: 'none',
                                    },
                                    '&:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                }}
                            >

                                {chromosomes.map((key) => (
                                    <MenuItem key={key} value={key} sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>
                                        {key}
                                    </MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </div>

                    {/* Resolution */}
                    <div className={style.dataResolution}>
                        <TextField
                            className={style.textfieldStyle}
                            fullWidth
                            id="filled-basic"
                            label="Resolution"
                            variant="filled"
                            type="number"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            sx={{
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    height: '51px',
                                    '&:before, &:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '12px',
                                },
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <FormControl variant="filled" sx={{ minWidth: 70 }}>
                            <InputLabel id="resolution-bases-unit" sx={{ fontSize: '12px' }}>Unit</InputLabel>
                            <Select
                                value={resolutionUnit}
                                id="resolution-bases-unit"
                                onChange={(e) => { setResolutionUnit(e.target.value) }}
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    borderBottom: 'none',
                                    m: 0,
                                    '&:before': {
                                        borderBottom: 'none',
                                    },
                                    '&:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                }}
                            >
                                <MenuItem value="Bp" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>bp</MenuItem>
                                <MenuItem value="Mb" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Mb</MenuItem>
                                <MenuItem value="Kb" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Kb</MenuItem>
                                <MenuItem value="Gb" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Gb</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <div className={style.outputTypeDiv}>
                        <FormControl variant="filled" sx={{ minWidth: '100%' }}>
                            <InputLabel id="outputType" sx={{ fontSize: '12px' }}>Output Type</InputLabel>
                            <Select
                                value={outputType}
                                id="outputType"
                                onChange={(e) => { setOutputType(e.target.value) }}
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    borderBottom: 'none',
                                    m: 0,
                                    '&:before': {
                                        borderBottom: 'none',
                                    },
                                    '&:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                }}
                            >
{menuItems.map((item) => (
        <MenuItem key={item.value} value={item.value} sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>
          {item.label}
        </MenuItem>
      ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div>
                        <TextField
                            className={style.textfieldStyle}
                            fullWidth
                            id="filled-basic"
                            label="Iterations"
                            variant="filled"
                            type="number"
                            value={iterations}
                            onChange={(e) => setIterations(e.target.value)}
                            sx={{
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    height: '50px',
                                    '&:before, &:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '12px',
                                },
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>



                    <div className={style.downweightingDiv}>
                        <FormControl variant="filled" sx={{ minWidth: '100%' }}>
                            <InputLabel id="downweighting" sx={{ fontSize: '12px' }}>Down-weighting</InputLabel>
                            <Select
                                value={downweighting}
                                id="downweighting"
                                onChange={(e) => { setDownweighting(e.target.value) }}
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    borderBottom: 'none',
                                    m: 0,
                                    '&:before': {
                                        borderBottom: 'none',
                                    },
                                    '&:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                }}
                            >
                                <MenuItem value="two_over_n" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Two/N</MenuItem>
                                <MenuItem value="n_minus_one" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>N - 1</MenuItem>
                                <MenuItem value="none" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>None</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <div className={style.heatmapPropertiesContainer}>
                    <p className={style.title}>Heatmap Properties</p>

                    <div className={style.heatmapValueDiv}>
                        <TextField
                            className={style.textfieldStyle}
                            fullWidth
                            id="filled-basic"
                            label="VMin (White)"
                            variant="filled"
                            type="number"
                            value={heatmapVMin}
                            onChange={(e) => setHeatmapVMin(e.target.value)}
                            sx={{
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    height: '40px',
                                    '&:before, &:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '12px',
                                },
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <p>-</p>

                        <TextField
                            className={style.textfieldStyle}
                            fullWidth
                            id="filled-basic"
                            label="VMax (Black)"
                            variant="filled"
                            type="number"
                            value={heatmapVMax}
                            onChange={(e) => setHeatmapVMax(e.target.value)}
                            sx={{
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    height: '40px',
                                    '&:before, &:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '12px',
                                },
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>

                    <p className={style.subtitle}>Axis Ticks</p>
                    <div>
                        <div className={style.dataResolution}>
                        <TextField
                            className={style.textfieldStyle}
                            fullWidth
                            id="axis-value"
                            label="Tick Interval"
                            variant="filled"
                            type="number"
                            value={axisValuePerUnit}
                            onChange={(e) => setAxisValuePerUnit(e.target.value)}
                            sx={{
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    height: '51px',
                                    '&:before, &:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '12px',
                                },
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <FormControl variant="filled" sx={{ minWidth: 70 }}>
                            <InputLabel id="tick-unit" sx={{ fontSize: '12px' }}>Unit</InputLabel>
                            <Select
                                value={axisUnit}
                                id="tick-unit"
                                onChange={(e) => { setAxisUnit(e.target.value) }}
                                variant="filled"
                                sx={{
                                    backgroundColor: 'rgb(246, 248, 249)',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    border: '1px solid rgb(227, 231, 233)',
                                    borderBottom: 'none',
                                    m: 0,
                                    '&:before': {
                                        borderBottom: 'none',
                                    },
                                    '&:after': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none',
                                    },
                                }}
                            >
                                <MenuItem value="Bp" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>bp</MenuItem>
                                <MenuItem value="Mb" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Mb</MenuItem>
                                <MenuItem value="Kb" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Kb</MenuItem>
                                <MenuItem value="Gb" sx={{ fontSize: '12px', paddingTop: '2px', paddingBottom: '2px' }}>Gb</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <p className={style.description}>Set the distance between ticks on the axis to customize the data intervals displayed e.g., 0 Mb, 5 Mb, 10 Mb.</p>

                    </div>
                </div>
            </div>

            <div className={style.applyDiv}>
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleApplyButton}
                    sx={{ textTransform: 'none' }}>
                    Apply
                </Button>
            </div>

        </Drawer>
    )
}

export default Sidebar;