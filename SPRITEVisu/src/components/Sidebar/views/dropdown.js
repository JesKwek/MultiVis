"use client"
import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/Inbox';
import style from './dropdown.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';


const CustomDropdown = (isHeatmap) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const HeatmapSection = ({ isMenu, isSelected, isHeatmap}) => (
        <div className={style.dropdownContainer} variant="contained" color="primary" onClick={handleClick}>
            <div className={style.dropdownLeftContainer}>
                <div className={[style.iconContainer, isHeatmap ? style.heatmapColor : style.networkColor].join(' ')}>
                    <Image
                        src={ isHeatmap ? "/heatmap.png" : "/network.png"} // Path to your image
                        alt="Description of the image"
                        width={16} // Fixed width
                        height={16} // Fixed height
                    />
                </div>
                <div className={[style.textContainer].join('')}>
                    <p className={style.title}>{isHeatmap ? "Interactive Heatmap" : "Network graphs"}</p>
                    <p className={style.subtitle}>{isHeatmap ? "Pairwise analysis" : "Multiplexed analysis" }</p>
                </div>
            </div>
            <div>
                {!isMenu &&
                    <Image
                        src="/down-arrow.png" // Path to your image
                        alt="Description of the image"
                        width={32} // Fixed width
                        height={32} // Fixed height
                    />}

                {isSelected &&
                    <Image
                        src="/check.png" // Path to your image
                        alt="Description of the image"
                        width={12} // Fixed width
                        height={12} // Fixed height
                    />}
            </div>
        </div>
    );

    return (
        <div>
            <HeatmapSection isMenu={false} isHeatmap={isHeatmap}/>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'custom-button',
                }}
                sx={{
                    '& .MuiPaper-root': {
                      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)', // Adjust the shadow here
                    },
                  }}
            >
                <MenuItem onClick={handleClose}>
                    <HeatmapSection isMenu={true} isSelected={true} isHeatmap={true}/>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                <HeatmapSection isMenu={true} isSelected={false} isHeatmap={false}/>
                </MenuItem>
            </Menu>
        </div>
    );
};

export default CustomDropdown;
