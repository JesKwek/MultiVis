import Image from 'next/image';
import styles from './RightSidebar.module.css';
import { useState } from 'react';
import XGeneGenerationSection from './Views/XGeneGenerationSection';
import GeneSetting from './Views/GeneSetting';
import YGeneGenerationSection from './Views/YGeneGenerationSection';
import Cookies from 'js-cookie';

const RightSidebar = ({
    xStartLoc,
    setXStartLoc,
    xStartLocUnit,
    setXStartLocUnit,
    xEndLoc,
    setXEndLoc,
    xEndLocUnit,
    setXEndLocUnit,

    yStartLoc,
    setYStartLoc,
    yStartLocUnit,
    setYStartLocUnit,
    yEndLoc,
    setYEndLoc,
    yEndLocUnit,
    setYEndLocUnit
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isInspectorMode, setIsInpectorMode] = useState(0);
    const [assembly, setAssembly] = useState(Cookies.get('assembly') || 'GRCh38');
    const [species, setSpecies] = useState(Cookies.get('species') || 'human');

    const sidebarHandler = () => {
        setIsOpen(!isOpen);
    }

    return (
        <>
            <div className={styles.sidebarContainer} onClick={sidebarHandler}>
                <Image
                    src="/sidebar_squares_right.png"
                    alt="Description of the image"
                    width={28}
                    height={24}
                />
            </div>

            <div className={[styles.sidebar, !isOpen && styles.sidebarHidden].join(' ')}>
                <h3>Gene Name Generation</h3>

                <div className={styles.toolbar}>
                    <div 
                        className={[styles.toolItem, isInspectorMode == 0 && styles.active].join(' ')}
                        onClick={() => { setIsInpectorMode(0) }}
                    >
                        <p>X-Axis</p>
                    </div>
                    <div 
                        className={[styles.toolItem, isInspectorMode == 1 && styles.active].join(' ')}
                        onClick={() => { setIsInpectorMode(1) }}
                    >
                        <p>Y-Axis</p>
                    </div>
                    <div 
                        className={[styles.toolItem, isInspectorMode == 2 && styles.active].join(' ')}
                        onClick={() => { setIsInpectorMode(2) }}
                    >
                        <p>Settings</p>
                    </div>
                </div>

                { isInspectorMode === 0 && <XGeneGenerationSection
                    assembly={assembly}
                    species={species}
                    startLoc={xStartLoc}
                    setStartLoc={setXStartLoc}
                    startLocUnit={xStartLocUnit}
                    setStartLocUnit={setXStartLocUnit}
                    endLoc={xEndLoc}
                    setEndLoc={setXEndLoc}
                    endLocUnit={xEndLocUnit}
                    setEndLocUnit={setXEndLocUnit}
                />}
                { isInspectorMode === 1 && <YGeneGenerationSection
                    assembly={assembly}
                    species={species}
                    startLoc={yStartLoc}
                    setStartLoc={setYStartLoc}
                    startLocUnit={yStartLocUnit}
                    setStartLocUnit={setYStartLocUnit}
                    endLoc={yEndLoc}
                    setEndLoc={setYEndLoc}
                    endLocUnit={yEndLocUnit}
                    setEndLocUnit={setYEndLocUnit}
                />}
                { isInspectorMode === 2 && <GeneSetting
                    assembly={assembly}
                    setAssembly={setAssembly}
                    species={species}
                    setSpecies={setSpecies}
                />}
            </div>
        </>
    )
};

export default RightSidebar;