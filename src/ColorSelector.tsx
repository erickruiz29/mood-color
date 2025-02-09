'use strict'

import { useEffect, useState } from 'react';
import chroma from 'chroma-js';
import { ChromePicker, ColorResult } from 'react-color';

const ColorSelector = () => {
    const [color, setColor] = useState('#abc123');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);

    const handleChange = (color: ColorResult) => {
        setColor(color.hex);
    };



    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        const handleOrientationChange = () => {
            if (window.innerWidth > window.innerHeight) {
                setIsLandscape(true);
            } else {
                setIsLandscape(false);
            }
        };

        window.addEventListener('resize', handleOrientationChange);
        handleOrientationChange();

        return () => {
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: isLandscape ? 'row' : 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1rem' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: color }} onClick={() => { selectedColors.push(color); setSelectedColors([...selectedColors]); }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: isLandscape ? 'column' : 'row', alignItems: 'center', flexWrap: 'nowrap', width: isLandscape ? '100px' : '100%', height: isLandscape ? '90vh' : '100px', padding: '1rem' }}>
                {(selectedColors).map((curColor) => {
                    const textColor = (chroma.contrast('#000000', curColor) > chroma.contrast('#ffffff', curColor) ? '#000000' : '#ffffff');
                    return (
                        <div key={curColor} style={{
                            minWidth: '20px',
                            width: 'inherit',
                            maxWidth: '100px',
                            minHeight: '20px',
                            height: isLandscape ? 'inherit' : '100px',
                            maxHeight: '100px',
                            backgroundColor: curColor,
                            color: textColor,
                            writingMode: (isLandscape ? 'initial' : 'vertical-rl'),
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            flex: '1',
                        }
                        }>{curColor}</div>)
                })}
            </div>
            <ChromePicker
                color={color}
                onChange={handleChange}
                styles={{ default: { picker: { width: '100%', maxWidth: '500px' }} }}
            />
        </div >
    );
};

export default ColorSelector;
