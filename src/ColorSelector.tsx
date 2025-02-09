'use strict'

import { useEffect, useState } from 'react';
import CopyIcon from './copy-icon.svg?react';
import Checkmark from './checkmark.svg?react';
import SaveIcon from './save-icon.svg?react';
import LoadIcon from './load-icon.svg?react';
import DownloadIcon from './download-icon.svg?react';
import DeleteIcon from './delete-icon.svg?react';
import chroma from 'chroma-js';
import { ChromePicker, ColorResult } from 'react-color';

interface SavedColors {
    colors: string[];
    location: string[];
    datetime: string;
}


const ColorSelector = () => {
    const [color, setColor] = useState('#abc123');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);
    const [retrievedColors, setRetrievedColors] = useState<SavedColors[]>([]);

    const handleChange = (color: ColorResult) => {
        setColor(color.hex);
    };

    const [isLandscape, setIsLandscape] = useState(false);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            });
        }
    }

    const copyToClipboard = (colors: string[]) => {
        const datetime = new Date().toLocaleString();
        let textToCopy = datetime;
        getLocation();
        if (location) {
            textToCopy += ` - Location: (${location.latitude}, ${location.longitude})`;
        }
        if (colors.length > 0) {
            textToCopy += ' - Colors: ' + colors.join(', ');
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

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
        getLocation();
        setRetrievedColors(JSON.parse(localStorage.getItem('colorsStorage') ?? "[]"));
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
                {(selectedColors).map((curColor, i) => {
                    const textColor = (chroma.contrast('#000000', curColor) > chroma.contrast('#ffffff', curColor) ? '#000000' : '#ffffff');
                    return (
                        <div key={curColor + i} style={{
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
                styles={{ default: { picker: { width: '100%', maxWidth: '500px' } } }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1rem' }}>
                <div onClick={() => copyToClipboard(selectedColors)} style={{ cursor: 'pointer' }}>
                    {(isCopied ? <Checkmark style={{ width: '50px', height: '50px' }} /> :
                        <CopyIcon style={{ width: '50px', height: '50px' }} />)}
                </div>
                <div onClick={() => {
                    //const retrievedColors: SavedColors[] = JSON.parse(localStorage.getItem('colorsStorage') ?? "[]");
                    setRetrievedColors(JSON.parse(localStorage.getItem('colorsStorage') ?? "[]"));
                    const datetime = new Date().toLocaleString();
                    const loc = location ? `(${location.latitude}, ${location.longitude})` : '';
                    retrievedColors.push({ colors: selectedColors, location: [loc], datetime });
                    localStorage.setItem('colorsStorage', JSON.stringify(retrievedColors));
                    setRetrievedColors(JSON.parse(localStorage.getItem('colorsStorage') ?? "[]"));
                }
                } style={{ cursor: 'pointer', marginLeft: '1rem' }}>
                    <SaveIcon style={{ width: '50px', height: '50px', }} />
                </div>
                <div onClick={() => {
                    const colorsCopy = JSON.parse(JSON.stringify(retrievedColors));
                    const lastColor = colorsCopy.pop() ?? { colors: [] };
                    setSelectedColors(lastColor.colors);
                }} style={{ cursor: 'pointer', marginLeft: '1rem' }}>
                    <LoadIcon style={{ width: '50px', height: '50px', }} />
                </div>
                <div onClick={() => {
                    setRetrievedColors(JSON.parse(localStorage.getItem('colorsStorage') ?? "[]"));
                    const datetime = new Date().toLocaleString();
                    const element = document.createElement("a");
                    const file = new Blob([JSON.stringify(retrievedColors, null, 2)], { type: 'application/json' });
                    element.href = URL.createObjectURL(file);
                    const sanitizedDatetime = datetime.replace(/\s+/g, '');
                    element.download = `colors-${sanitizedDatetime}.json`;
                    if (navigator.userAgent.includes('FxiOS')) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            window.location.href = reader.result as string;
                        };
                        reader.readAsDataURL(file);
                    }
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }} style={{ cursor: 'pointer', marginLeft: '1rem' }}>
                    <DownloadIcon style={{ width: '50px', height: '50px', }} />
                </div>
                <div onClick={() => {
                    if (window.confirm('Are you sure you want to delete all saved colors?')) {
                        localStorage.setItem('colorsStorage', JSON.stringify([]));
                        setRetrievedColors(JSON.parse(localStorage.getItem('colorsStorage') ?? "[]"));
                    }
                }} style={{ cursor: 'pointer', marginLeft: '1rem' }}>
                    <DeleteIcon style={{ width: '50px', height: '50px', }} />
                </div>
            </div>
        </div >
    );
};

export default ColorSelector;
