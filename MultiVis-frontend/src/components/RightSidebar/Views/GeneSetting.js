import { useState, useEffect } from 'react';
import style from './GeneSetting.module.css';
import { TextField } from '@mui/material';
import Cookies from 'js-cookie';
import Link from 'next/link';

const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const GeneSetting = ({
    assembly,
    setAssembly,
    species,
    setSpecies
}) => {
    // Initialize states from cookies or default values

    // Save to cookies with debounce
    const saveToCookies = debounce((key, value) => {
        Cookies.set(key, value, { expires: 7 }); // Set cookies to expire in 7 days
    }, 500);

    // Handle changes and save to cookies
    const handleAssemblyChange = (e) => {
        const value = e.target.value;
        setAssembly(value);
        saveToCookies('assembly', value);
    };

    const handleSpeciesChange = (e) => {
        const value = e.target.value;
        setSpecies(value);
        saveToCookies('species', value);
    };

    useEffect(() => {
        if (!Cookies.get('assembly')) {
            Cookies.set('assembly', assembly, { expires: 7 });
        }
        if (!Cookies.get('species')) {
            Cookies.set('species', species, { expires: 7 });
        }
    }, [assembly, species]);

    return (
        <div className={style.content}>
            <p className={style.label}>Genome assemblies should follow the Genome Reference Consortium (GRC) naming convention; for example, hg38 is GRCh38. <Link href=''>Find out more</Link>.</p>
            <TextField
                className={style.textfieldStyle}
                fullWidth
                id="assembly-input"
                label="Genome Assembly"
                variant="filled"
                type="text"
                value={assembly}
                onChange={handleAssemblyChange}
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
                InputLabelProps={{
                    shrink: true,
                }}
            />

            <TextField
                className={style.textfieldStyle}
                fullWidth
                id="species-input"
                label="Species"
                variant="filled"
                type="text"
                value={species}
                onChange={handleSpeciesChange}
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
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </div>
    );
};

export default GeneSetting;
