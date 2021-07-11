import React, { useState, useEffect } from 'react'

import {ReactComponent as Logo} from '../../assets/icons/Logo.svg';

import './loadingPage.css'

const LoadingPage = ( { loaded = false, fadeOutTime, onFadeOut } ) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if(loaded) {
            setFadeOut(true);
            setTimeout(() => {
                onFadeOut && onFadeOut();
            }, fadeOutTime);
        }
    }, [loaded, fadeOutTime]);

    const getClasses = (baseClass) => {
        return baseClass + (fadeOut ? " fade-out" : "");
    };

    return (
        <div className={getClasses("loading-page")}>
            {<Logo className="logo" />}
        </div>
    )
}

export default LoadingPage
