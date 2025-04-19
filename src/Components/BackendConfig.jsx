import React, { useState, useEffect } from 'react';
import { setLocalBackendUrl, getCurrentBackendUrl } from '../config';
import './BackendConfig.css';

const BackendConfig = () => {
    const [localUrl, setLocalUrl] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [isConfiguring, setIsConfiguring] = useState(false);

    useEffect(() => {
        // Get current backend URL on component mount
        setCurrentUrl(getCurrentBackendUrl());
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (localUrl) {
            // Remove trailing slash if present
            const cleanUrl = localUrl.replace(/\/$/, '');
            setLocalBackendUrl(cleanUrl);
            setCurrentUrl(getCurrentBackendUrl());
            setIsConfiguring(false);
            // Reload the page to apply new configuration
            window.location.reload();
        }
    };

    const handleReset = () => {
        localStorage.removeItem('localBackendUrl');
        setCurrentUrl(getCurrentBackendUrl());
        setIsConfiguring(false);
        // Reload the page to apply default configuration
        window.location.reload();
    };

    return (
        <div className="backend-config">
            <div className="current-config">
                <p>Current Backend URL: {currentUrl}</p>
                <button 
                    onClick={() => setIsConfiguring(!isConfiguring)}
                    className="config-toggle"
                >
                    {isConfiguring ? 'Cancel' : 'Configure Backend URL'}
                </button>
            </div>

            {isConfiguring && (
                <form onSubmit={handleSubmit} className="config-form">
                    <div className="form-group">
                        <label htmlFor="localUrl">Backend URL:</label>
                        <input
                            type="text"
                            id="localUrl"
                            value={localUrl}
                            onChange={(e) => setLocalUrl(e.target.value)}
                            placeholder="http://localhost:8000"
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="save-button">
                            Save Configuration
                        </button>
                        <button 
                            type="button" 
                            onClick={handleReset}
                            className="reset-button"
                        >
                            Reset to Default
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default BackendConfig; 