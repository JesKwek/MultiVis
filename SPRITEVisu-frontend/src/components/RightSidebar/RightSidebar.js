import Image from 'next/image';
import styles from './RightSidebar.module.css';
import { useState } from 'react';

const RightSidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isInspectorMode, setIsInpectorMode] = useState(true);

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
                <div className={styles.toolbar}>
                    <div 
                        className={[styles.toolItem, isInspectorMode && styles.active].join(' ')}
                        onClick={() => { setIsInpectorMode(true) }}
                    >
                        <p>Inspector</p>
                    </div>
                    <div 
                        className={[styles.toolItem, !isInspectorMode && styles.active].join(' ')}
                        onClick={() => { setIsInpectorMode(false) }}
                    >
                        <p>Settings</p>
                    </div>
                </div>
            </div>
        </>
    )
};

export default RightSidebar;