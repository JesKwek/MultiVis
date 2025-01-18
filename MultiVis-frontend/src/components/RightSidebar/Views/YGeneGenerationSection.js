import { useState } from 'react';
import style from './XGeneGenerationSection.module.css';
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Divider from '@mui/material/Divider';
import GeneInformation from './GeneInformation';
import { LoadingButton } from '@mui/lab';

const YGeneGenerationSection = ({
    assembly,
    species,
    startLoc,
    setStartLoc,
    startLocUnit,
    setStartLocUnit,
    endLoc,
    setEndLoc,
    endLocUnit,
    setEndLocUnit
}) => {
    const [GRCName, setGRCName] = useState('1');

    const [genes, setGenes] = useState([]);
    const [loading, setLoading] = useState(false); // State for loading
    const [error, setError] = useState(''); // State for error message

    const convertToBasePairs = (value, unit) => {
        const unitConversion = {
            Bp: 1,
            Kb: 1000,
            Mb: 1000000,
            Gb: 1000000000,
        };
        return value * unitConversion[unit];
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(''); // Clear previous error messages
        try {
            const start = convertToBasePairs(Number(startLoc), startLocUnit);
            const end = convertToBasePairs(Number(endLoc), endLocUnit);

            const response = await fetch(
                `https://rest.ensembl.org/overlap/region/${species}/${GRCName}:${start}-${end}?feature=gene;coord_system_version=${assembly}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const data = await response.json();
            if (data.length === 0) {
                setGenes([]); // No genes found
            } else {
                setGenes(data); // Update the genes state with the fetched data
            }
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.outer}>
            <div className={style.content}>
                <p className={style.label}>
                    Chromosomes should follow the Genome Reference Consortium (GRC) naming convention; for example, "chromosome 1" should be written as "1." Please update it if the auto-generation is incorrect. <a href="">Find out more</a>.
                </p>

                {/* Input Fields */}
                <div>
                    <TextField
                        className={style.textfieldStyle}
                        fullWidth
                        id="filled-basic"
                        label="GRC name"
                        variant="filled"
                        type="text"
                        value={GRCName}
                        onChange={(e) => setGRCName(e.target.value)}
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
                </div>

                {/* Start Location Fields */}
                <div className={style.multiplesFields}>
                    <TextField
                        className={style.textfieldStyle}
                        fullWidth
                        id="filled-basic"
                        label="Start Location"
                        variant="filled"
                        type="number"
                        value={startLoc}
                        onChange={(e) => setStartLoc(e.target.value)}
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
                        <InputLabel id="start-location-unit" sx={{ fontSize: '12px' }}>Unit</InputLabel>
                        <Select
                            value={startLocUnit}
                            id="start-location-unit"
                            onChange={(e) => setStartLocUnit(e.target.value)}
                            variant="filled"
                            sx={{
                                backgroundColor: 'rgb(246, 248, 249)',
                                borderRadius: '4px',
                                fontSize: '12px',
                                border: '1px solid rgb(227, 231, 233)',
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
                            <MenuItem value="Bp">bp</MenuItem>
                            <MenuItem value="Mb">Mb</MenuItem>
                            <MenuItem value="Kb">Kb</MenuItem>
                            <MenuItem value="Gb">Gb</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* End Location Fields */}
                <div className={style.multiplesFields}>
                    <TextField
                        className={style.textfieldStyle}
                        fullWidth
                        id="filled-basic"
                        label="End Location"
                        variant="filled"
                        type="number"
                        value={endLoc}
                        onChange={(e) => setEndLoc(e.target.value)}
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
                        <InputLabel id="end-location-unit" sx={{ fontSize: '12px' }}>Unit</InputLabel>
                        <Select
                            value={endLocUnit}
                            id="end-location-unit"
                            onChange={(e) => setEndLocUnit(e.target.value)}
                            variant="filled"
                            sx={{
                                backgroundColor: 'rgb(246, 248, 249)',
                                borderRadius: '4px',
                                fontSize: '12px',
                                border: '1px solid rgb(227, 231, 233)',
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
                            <MenuItem value="Bp">bp</MenuItem>
                            <MenuItem value="Mb">Mb</MenuItem>
                            <MenuItem value="Kb">Kb</MenuItem>
                            <MenuItem value="Gb">Gb</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* Generate Button */}
                <div className={style.applyDiv}>
                    <LoadingButton
                        fullWidth
                        loading={loading}
                        variant="contained"
                        color="primary"
                        onClick={handleGenerate}
                        sx={{ textTransform: 'none' }}
                    >
                        Generate
                    </LoadingButton>
                </div>
            </div>
            <br />
            <Divider />
            <br />

            {/* Display Gene Information or Messages */}
            <div className={style.geneInfos}>
                {error && <p className={style.errorMessage}>{error}</p>}
                {!error && genes.length === 0 && <p className={style.noGenesMessage}>No genes found.</p>}
                {genes.map((gene) => (
                    <GeneInformation
                        key={gene.id || gene.gene_id}
                        name={gene.external_name || ''}
                        description={gene.description || ''}
                        start={gene.start}
                        end={gene.end}
                        gene_id={gene.id || gene.gene_id}
                        logic_name={gene.logic_name || ''}
                        source={gene.source || ''}
                        biotype={gene.biotype || ''}
                        seq_region_name={gene.seq_region_name || ''}
                        id={gene.id || ''}
                        feature_type={gene.feature_type || ''}
                        strand={gene.strand || ''}
                        assembly_name={gene.assembly_name || ''}
                        version={gene.version || ''}
                    />
                ))}
            </div>
        </div>
    );
};

export default YGeneGenerationSection;
